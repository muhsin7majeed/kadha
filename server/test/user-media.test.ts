import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization } from './helpers/auth';
import { registerTestUser } from './helpers/auth';
import { updateUserPrivacy } from './helpers/user';
import {
  buildTestMediaPayload,
  getCurrentUserMediaList,
  getCurrentUserMediaListWithQuery,
  getUserMediaListByUsername,
  updateUserMediaFlag,
} from './helpers/user-media';

describe('user media routes', () => {
  it('adds and removes liked media for the current user', async () => {
    const user = await registerTestUser('liked-user');
    const mediaId = 881101;

    const likedResponse = await updateUserMediaFlag(user, 'liked', true, mediaId);

    expect(likedResponse.body).toEqual({ message: 'movie liked' });

    const likedList = await getCurrentUserMediaList(user, 'liked');

    expect(likedList.pagination.total).toBe(1);
    expect(likedList.data[0]).toMatchObject({
      media_id: mediaId,
      media_type: 'movie',
      title: `Test Movie ${mediaId}`,
      liked: true,
      watched: false,
      watchlist: false,
    });
    expect(likedList.data[0]?.likedAt).toEqual(expect.any(String));

    const unlikedResponse = await updateUserMediaFlag(user, 'liked', false, mediaId);

    expect(unlikedResponse.body).toEqual({ message: 'movie unliked' });

    const updatedLikedList = await getCurrentUserMediaList(user, 'liked');

    expect(updatedLikedList.pagination.total).toBe(0);
    expect(updatedLikedList.data).toEqual([]);
  });

  it('adds and removes watchlist media for the current user', async () => {
    const user = await registerTestUser('watchlist-user');
    const mediaId = 881201;

    const watchlistResponse = await updateUserMediaFlag(user, 'watchlist', true, mediaId);

    expect(watchlistResponse.body).toEqual({ message: 'movie added to watchlist' });

    const watchlist = await getCurrentUserMediaList(user, 'watchlist');

    expect(watchlist.pagination.total).toBe(1);
    expect(watchlist.data[0]).toMatchObject({
      media_id: mediaId,
      watchlist: true,
      watched: false,
      liked: false,
    });
    expect(watchlist.data[0]?.watchlistAt).toEqual(expect.any(String));

    const removedResponse = await updateUserMediaFlag(user, 'watchlist', false, mediaId);

    expect(removedResponse.body).toEqual({ message: 'movie removed from watchlist' });

    const updatedWatchlist = await getCurrentUserMediaList(user, 'watchlist');

    expect(updatedWatchlist.pagination.total).toBe(0);
    expect(updatedWatchlist.data).toEqual([]);
  });

  it('marks media watched and removes it from the watchlist', async () => {
    const user = await registerTestUser('watched-user');
    const mediaId = 881301;

    await updateUserMediaFlag(user, 'watchlist', true, mediaId);

    const watchedResponse = await updateUserMediaFlag(user, 'watched', true, mediaId);

    expect(watchedResponse.body).toEqual({ message: 'movie watched' });

    const watchedList = await getCurrentUserMediaList(user, 'watched');

    expect(watchedList.pagination.total).toBe(1);
    expect(watchedList.data[0]).toMatchObject({
      media_id: mediaId,
      watched: true,
      watchlist: false,
    });
    expect(watchedList.data[0]?.watchedAt).toEqual(expect.any(String));

    const watchlist = await getCurrentUserMediaList(user, 'watchlist');

    expect(watchlist.pagination.total).toBe(0);
    expect(watchlist.data).toEqual([]);
  });

  it('keeps media state isolated between users', async () => {
    const firstUser = await registerTestUser('media-first-user');
    const secondUser = await registerTestUser('media-second-user');
    const mediaId = 881401;

    await updateUserMediaFlag(firstUser, 'liked', true, mediaId);

    const firstUserLiked = await getCurrentUserMediaList(firstUser, 'liked');
    const secondUserLiked = await getCurrentUserMediaList(secondUser, 'liked');

    expect(firstUserLiked.pagination.total).toBe(1);
    expect(firstUserLiked.data[0]).toMatchObject({ media_id: mediaId, liked: true });
    expect(secondUserLiked.pagination.total).toBe(0);
    expect(secondUserLiked.data).toEqual([]);
  });

  it('saves title-level rating, notes, watched date, and related liked state', async () => {
    const user = await registerTestUser('tracking-details-user');
    const mediaId = 881501;

    await updateUserMediaFlag(user, 'watched', true, mediaId, {
      liked: true,
      rating: 9,
      watchedOn: '2026-01-15',
      watchedNote: 'A sharp rewatch.',
    });

    const watchedList = await getCurrentUserMediaList(user, 'watched');

    expect(watchedList.data[0]).toMatchObject({
      media_id: mediaId,
      watched: true,
      liked: true,
      rating: 9,
      watchedOn: '2026-01-15',
      watchedNote: 'A sharp rewatch.',
    });
    expect(watchedList.data[0]?.ratedAt).toEqual(expect.any(String));

    await updateUserMediaFlag(user, 'watched', true, mediaId, {
      liked: true,
      rating: 9,
      watchedOn: '2026-01-16',
      watchedNote: 'Updated without logging another watch.',
    });

    const events = await prisma.watchEvent.findMany({ where: { userId: user.userId, media_id: mediaId } });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      watchedOn: new Date('2026-01-16T00:00:00.000Z'),
      note: 'Updated without logging another watch.',
      rating: null,
    });
  });

  it('keeps ratedAt stable when the rating is unchanged and clears it with the rating', async () => {
    const user = await registerTestUser('rating-clear-user');
    const mediaId = 881601;

    await updateUserMediaFlag(user, 'liked', true, mediaId, {
      rating: 8,
      likedNote: 'Strong personal favorite.',
    });

    const likedList = await getCurrentUserMediaList(user, 'liked');
    const originalRatedAt = likedList.data[0]?.ratedAt;

    await updateUserMediaFlag(user, 'liked', true, mediaId, {
      rating: 8,
      likedNote: 'Strong personal favorite.',
    });

    const unchangedLikedList = await getCurrentUserMediaList(user, 'liked');

    expect(unchangedLikedList.data[0]?.ratedAt).toBe(originalRatedAt);

    await updateUserMediaFlag(user, 'liked', true, mediaId, {
      rating: null,
      likedNote: '',
    });

    const clearedLikedList = await getCurrentUserMediaList(user, 'liked');

    expect(clearedLikedList.data[0]).toMatchObject({
      rating: null,
      ratedAt: null,
      likedNote: null,
    });
  });

  it('validates tracking detail bounds', async () => {
    const user = await registerTestUser('tracking-validation-user');
    const app = await getTestApp();

    const invalidRating = await request(app)
      .post('/api/user-media/liked')
      .set('Authorization', authorization(user))
      .send(buildTestMediaPayload({ liked: true, rating: 11 }))
      .expect(400);

    expect(invalidRating.body.fieldErrors.rating).toBe('Number must be less than or equal to 10');

    const invalidNote = await request(app)
      .post('/api/user-media/watchlist')
      .set('Authorization', authorization(user))
      .send(buildTestMediaPayload({ watchlist: true, watchlistNote: 'x'.repeat(501) }))
      .expect(400);

    expect(invalidNote.body.fieldErrors.watchlistNote).toBe('Note must be 500 characters or less');

    const futureWatchedDate = await request(app)
      .post('/api/user-media/watched')
      .set('Authorization', authorization(user))
      .send(buildTestMediaPayload({ watched: true, watchedOn: '2999-01-01' }))
      .expect(400);

    expect(futureWatchedDate.body.fieldErrors.watchedOn).toBe('Watched date cannot be in the future');
  });

  it('keeps tracking notes scoped per user', async () => {
    const firstUser = await registerTestUser('notes-first-user');
    const secondUser = await registerTestUser('notes-second-user');
    const mediaId = 881701;

    await updateUserMediaFlag(firstUser, 'watchlist', true, mediaId, {
      watchlistNote: 'Watch with family.',
    });
    await updateUserMediaFlag(secondUser, 'watchlist', true, mediaId, {
      watchlistNote: 'Recommended by Alex.',
    });

    const firstWatchlist = await getCurrentUserMediaList(firstUser, 'watchlist');
    const secondWatchlist = await getCurrentUserMediaList(secondUser, 'watchlist');

    expect(firstWatchlist.data[0]?.watchlistNote).toBe('Watch with family.');
    expect(secondWatchlist.data[0]?.watchlistNote).toBe('Recommended by Alex.');
  });

  it('does not expose private tracking details through profile media APIs', async () => {
    const owner = await registerTestUser('tracking-private-owner');
    const viewer = await registerTestUser('tracking-private-viewer');
    const mediaId = 881801;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'KADHA_USERS',
      likedPrivacy: 'KADHA_USERS',
    });
    await updateUserMediaFlag(owner, 'liked', true, mediaId, {
      rating: 10,
      likedNote: 'Private taste note.',
    });
    await updateUserMediaFlag(owner, 'watched', true, mediaId, { liked: true });

    const ownerLiked = await getCurrentUserMediaList(owner, 'liked');
    const publicLiked = await getUserMediaListByUsername(viewer, owner.username, 'liked');

    expect(ownerLiked.data[0]).toMatchObject({
      rating: 10,
      likedNote: 'Private taste note.',
    });
    expect(publicLiked.data[0]).toMatchObject({
      media_id: mediaId,
      liked: true,
    });
    expect(publicLiked.data[0]).not.toHaveProperty('rating');
    expect(publicLiked.data[0]).not.toHaveProperty('likedNote');
    expect(publicLiked.data[0]).not.toHaveProperty('watchCount');
  });

  it('filters owner libraries by title, media type, year, and personal rating before pagination', async () => {
    const user = await registerTestUser('library-filter-user');

    await updateUserMediaFlag(user, 'liked', true, 882001, { rating: 8 });
    await request(await getTestApp())
      .post('/api/user-media/liked')
      .set('Authorization', authorization(user))
      .send(
        buildTestMediaPayload({
          mediaId: 882002,
          mediaType: 'tv',
          liked: true,
          rating: 10,
          title: 'Northern Lights',
          originalTitle: 'Aurora',
          releaseDate: '2022-03-04',
        }),
      )
      .expect(200);
    await request(await getTestApp())
      .post('/api/user-media/liked')
      .set('Authorization', authorization(user))
      .send(
        buildTestMediaPayload({ mediaId: 882003, liked: true, title: 'Unrated Lights', releaseDate: '2018-01-01' }),
      )
      .expect(200);

    const filtered = await getCurrentUserMediaListWithQuery(user, 'liked', {
      query: 'aurora',
      mediaType: 'tv',
      yearFrom: 2020,
      yearTo: 2024,
      rating: 9,
      page: 1,
      limit: 1,
    });

    expect(filtered.status).toBe(200);
    expect(filtered.body.pagination.total).toBe(1);
    expect(filtered.body.data.map((item: { media_id: number }) => item.media_id)).toEqual([882002]);

    const unrated = await getCurrentUserMediaListWithQuery(user, 'liked', { rating: 'unrated' });
    expect(unrated.status).toBe(200);
    expect(unrated.body.data.map((item: { media_id: number }) => item.media_id)).toEqual([882003]);

    const rated = await getCurrentUserMediaListWithQuery(user, 'liked', { rating: 'rated' });
    expect(rated.status).toBe(200);
    expect(rated.body.pagination.total).toBe(2);
  });

  it('requires every selected genre and returns facets from the complete flagged library', async () => {
    const user = await registerTestUser('library-genre-user');

    for (const [mediaId, genres] of [
      [882101, [12, 18]],
      [882102, [12]],
      [882103, [18, 35]],
      [882104, [80]],
    ] as const) {
      await request(await getTestApp())
        .post('/api/user-media/watchlist')
        .set('Authorization', authorization(user))
        .send(buildTestMediaPayload({ mediaId, watchlist: true, genreIds: [...genres] }))
        .expect(200);
    }

    await prisma.genre.createMany({
      data: [
        { id: 12, name: 'Adventure' },
        { id: 18, name: 'Drama' },
        { id: 35, name: 'Comedy' },
      ],
    });
    const snapshots = await prisma.mediaSnapshot.findMany({ where: { media_id: { in: [882101, 882102, 882103] } } });
    await prisma.mediaGenre.createMany({
      data: snapshots.flatMap((snapshot) =>
        JSON.parse(snapshot.genre_ids ?? '[]').map((genreId: number) => ({ mediaSnapshotId: snapshot.id, genreId })),
      ),
    });

    const response = await getCurrentUserMediaListWithQuery(user, 'watchlist', { genres: '12,18' });

    expect(response.status).toBe(200);
    expect(response.body.data.map((item: { media_id: number }) => item.media_id)).toEqual([882101]);
    expect(response.body.facets).toEqual({
      genres: [
        { id: 12, name: 'Adventure' },
        { id: 35, name: 'Comedy' },
        { id: 18, name: 'Drama' },
      ],
      years: { min: 2026, max: 2026 },
    });

    const pendingGenre = await getCurrentUserMediaListWithQuery(user, 'watchlist', { genres: '80' });
    expect(pendingGenre.body.data).toEqual([]);
    expect(response.body.facets.genres).not.toContainEqual(expect.objectContaining({ id: 80 }));

    const otherUser = await registerTestUser('library-genre-other-user');
    await request(await getTestApp())
      .post('/api/user-media/watchlist')
      .set('Authorization', authorization(otherUser))
      .send(buildTestMediaPayload({ mediaId: 882105, watchlist: true, genreIds: [99] }))
      .expect(200);
    await prisma.genre.create({ data: { id: 99, name: 'Other User Genre' } });
    const otherSnapshot = await prisma.mediaSnapshot.findUniqueOrThrow({
      where: { media_id_media_type: { media_id: 882105, media_type: 'movie' } },
    });
    await prisma.mediaGenre.create({ data: { mediaSnapshotId: otherSnapshot.id, genreId: 99 } });
    const ownerFacets = await getCurrentUserMediaListWithQuery(user, 'watchlist', {});
    expect(ownerFacets.body.facets.genres).not.toContainEqual(expect.objectContaining({ id: 99 }));
  });

  it('sorts owner libraries with nulls last and deterministic ties', async () => {
    const user = await registerTestUser('library-sort-user');
    const entries = [
      {
        mediaId: 882201,
        title: 'Zulu',
        releaseDate: '2020-01-01',
        runtime: 90,
        voteAverage: 7,
        voteCount: 500,
        rating: 6,
      },
      {
        mediaId: 882202,
        title: 'alpha',
        releaseDate: '2022-01-01',
        runtime: 120,
        voteAverage: 9,
        voteCount: 10,
        rating: 10,
      },
      {
        mediaId: 882203,
        title: '',
        releaseDate: '',
        runtime: null,
        voteAverage: 9,
        voteCount: 100,
        rating: null,
      },
    ];

    for (const entry of entries) {
      await request(await getTestApp())
        .post('/api/user-media/watched')
        .set('Authorization', authorization(user))
        .send(buildTestMediaPayload({ ...entry, watched: true }))
      .expect(200);
    }

    await Promise.all(
      entries.map((entry, index) =>
        prisma.userMedia.update({
          where: {
            userId_media_id_media_type: { userId: user.userId, media_id: entry.mediaId, media_type: 'movie' },
          },
          data: { watchedAt: new Date(`2020-01-0${index + 1}T00:00:00.000Z`) },
        }),
      ),
    );

    const byTitle = await getCurrentUserMediaListWithQuery(user, 'watched', { sort: 'title', order: 'asc' });
    expect(byTitle.body.data.map((item: { media_id: number }) => item.media_id)).toEqual([882202, 882201, 882203]);

    const byScore = await getCurrentUserMediaListWithQuery(user, 'watched', { sort: 'tmdbScore', order: 'desc' });
    expect(byScore.body.data.map((item: { media_id: number }) => item.media_id)).toEqual([882203, 882202, 882201]);

    const byRuntime = await getCurrentUserMediaListWithQuery(user, 'watched', {
      mediaType: 'movie',
      sort: 'runtime',
      order: 'desc',
    });
    expect(byRuntime.body.data.map((item: { media_id: number }) => item.media_id)).toEqual([882202, 882201, 882203]);

    const cases = [
      [{ sort: 'added', order: 'asc' }, [882201, 882202, 882203]],
      [{}, [882203, 882202, 882201]],
      [{ sort: 'title', order: 'desc' }, [882201, 882202, 882203]],
      [{ sort: 'releaseDate', order: 'asc' }, [882201, 882202, 882203]],
      [{ sort: 'releaseDate', order: 'desc' }, [882202, 882201, 882203]],
      [{ sort: 'rating', order: 'asc' }, [882201, 882202, 882203]],
      [{ sort: 'rating', order: 'desc' }, [882202, 882201, 882203]],
      [{ sort: 'tmdbScore', order: 'asc' }, [882201, 882203, 882202]],
      [{ sort: 'runtime', order: 'asc', mediaType: 'movie' }, [882201, 882202, 882203]],
    ] as const;

    for (const [query, expectedIds] of cases) {
      const response = await getCurrentUserMediaListWithQuery(user, 'watched', query);
      expect(response.body.data.map((item: { media_id: number }) => item.media_id)).toEqual(expectedIds);
    }
  });

  it('uses media type and media ID as stable title tie-breakers across pages', async () => {
    const user = await registerTestUser('library-title-tie-user');

    for (const mediaType of ['movie', 'tv'] as const) {
      await request(await getTestApp())
        .post('/api/user-media/liked')
        .set('Authorization', authorization(user))
        .send(buildTestMediaPayload({ mediaId: 882301, mediaType, liked: true }))
        .expect(200);
      await prisma.mediaSnapshot.update({
        where: { media_id_media_type: { media_id: 882301, media_type: mediaType } },
        data: { title: null },
      });
    }

    const firstPage = await getCurrentUserMediaListWithQuery(user, 'liked', {
      sort: 'title',
      order: 'asc',
      page: 1,
      limit: 1,
    });
    const secondPage = await getCurrentUserMediaListWithQuery(user, 'liked', {
      sort: 'title',
      order: 'asc',
      page: 2,
      limit: 1,
    });

    expect([firstPage.body.data[0].media_type, secondPage.body.data[0].media_type]).toEqual(['movie', 'tv']);

    for (const mediaId of [882302, 882303]) {
      await request(await getTestApp())
        .post('/api/user-media/liked')
        .set('Authorization', authorization(user))
        .send(buildTestMediaPayload({ mediaId, liked: true, title: 'Same title' }))
        .expect(200);
    }
    const sameTitleFirstPage = await getCurrentUserMediaListWithQuery(user, 'liked', {
      query: 'Same title',
      sort: 'title',
      order: 'asc',
      page: 1,
      limit: 1,
    });
    const sameTitleSecondPage = await getCurrentUserMediaListWithQuery(user, 'liked', {
      query: 'Same title',
      sort: 'title',
      order: 'asc',
      page: 2,
      limit: 1,
    });
    expect([sameTitleFirstPage.body.data[0].media_id, sameTitleSecondPage.body.data[0].media_id]).toEqual([
      882302, 882303,
    ]);
  });

  it('rejects invalid owner library query combinations', async () => {
    const user = await registerTestUser('library-query-validation-user');

    const invalidRuntime = await getCurrentUserMediaListWithQuery(user, 'liked', { sort: 'runtime' });
    expect(invalidRuntime.status).toBe(400);

    const invalidYears = await getCurrentUserMediaListWithQuery(user, 'liked', { yearFrom: 2025, yearTo: 2020 });
    expect(invalidYears.status).toBe(400);

    const invalidGenres = await getCurrentUserMediaListWithQuery(user, 'liked', { genres: '12,nope' });
    expect(invalidGenres.status).toBe(400);

    const invalidQueries = [
      { page: 0 },
      { limit: 51 },
      { query: 'x'.repeat(121) },
      { mediaType: 'book' },
      { yearFrom: 1873 },
      { yearTo: 10000 },
      { rating: 11 },
      { sort: 'popularity' },
      { order: 'sideways' },
    ];

    for (const query of invalidQueries) {
      const response = await getCurrentUserMediaListWithQuery(user, 'liked', query);
      expect(response.status).toBe(400);
    }
  });
});
