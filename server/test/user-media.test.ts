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
      profilePrivacy: 'EVERYONE',
      likedPrivacy: 'EVERYONE',
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
});
