import { MediaType } from '@prisma/client';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser, TestUser } from './helpers/auth';

interface SeedEventOptions {
  mediaId: number;
  mediaType: MediaType;
  title?: string;
  runtime?: number | null;
  watchedOn?: string | null;
  watchedAt?: string;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeId?: number | null;
  eventRating?: number | null;
  userMediaRating?: number | null;
  createSnapshot?: boolean;
  note?: string | null;
}

const seedEvent = async (user: TestUser, options: SeedEventOptions) => {
  const {
    mediaId,
    mediaType,
    title = `${mediaType === MediaType.movie ? 'Movie' : 'Series'} ${mediaId}`,
    runtime = mediaType === MediaType.movie ? 120 : 45,
    watchedOn = '2026-09-13',
    watchedAt = `${watchedOn ?? '2026-09-13'}T12:00:00.000Z`,
    seasonNumber = mediaType === MediaType.tv ? 1 : null,
    episodeNumber = mediaType === MediaType.tv ? 1 : null,
    episodeId = null,
    eventRating = null,
    userMediaRating = null,
    createSnapshot = true,
    note = null,
  } = options;

  if (createSnapshot) {
    await prisma.mediaSnapshot.upsert({
      where: {
        media_id_media_type: { media_id: mediaId, media_type: mediaType },
      },
      update: { title, runtime },
      create: {
        media_id: mediaId,
        media_type: mediaType,
        title,
        original_title: `${title} original`,
        overview: `${title} overview`,
        poster_path: `/poster-${mediaId}.jpg`,
        backdrop_path: `/backdrop-${mediaId}.jpg`,
        vote_average: 7.5,
        vote_count: 100,
        popularity: 10,
        adult: false,
        genre_ids: '[18]',
        release_date: '2024-01-02',
        original_language: 'en',
        runtime,
        status: 'Released',
      },
    });

    await prisma.userMedia.upsert({
      where: {
        userId_media_id_media_type: {
          userId: user.userId,
          media_id: mediaId,
          media_type: mediaType,
        },
      },
      update: { rating: userMediaRating },
      create: {
        userId: user.userId,
        media_id: mediaId,
        media_type: mediaType,
        watched: true,
        rating: userMediaRating,
      },
    });
  }

  return prisma.watchEvent.create({
    data: {
      userId: user.userId,
      media_id: mediaId,
      media_type: mediaType,
      seasonNumber,
      episodeNumber,
      episodeId,
      watchedOn: watchedOn === null ? null : new Date(`${watchedOn}T00:00:00.000Z`),
      watchedAt: new Date(watchedAt),
      rating: eventRating,
      note,
    },
  });
};

describe('viewing diary timeline route', () => {
  it('requires authentication and validates pagination and mutually exclusive date filters', async () => {
    const user = await registerTestUser('diary-validation-user');
    const app = await getTestApp();

    await request(app).get('/api/user-media/diary').expect(401);

    for (const query of [
      { page: 0 },
      { limit: 51 },
      { mediaType: 'person' },
      { month: 9 },
      { year: 2026, month: 13 },
      { date: '2026-02-30' },
      { date: '2026-09-13', year: 2026 },
      { date: '2026-09-13', month: 9 },
    ]) {
      await request(app)
        .get('/api/user-media/diary')
        .query(query)
        .set('Authorization', authorization(user))
        .expect(400);
    }
  });

  it('returns only the owner valid movie and complete episode events with batched enrichment and honest coverage', async () => {
    const owner = await registerTestUser('diary-owner');
    const otherUser = await registerTestUser('diary-other-user');
    const app = await getTestApp();

    await seedEvent(owner, {
      mediaId: 9101,
      mediaType: MediaType.movie,
      title: 'Rated movie',
      runtime: 118,
      watchedOn: '2026-09-13',
      userMediaRating: 9,
      note: 'Worth revisiting.',
    });
    await seedEvent(owner, {
      mediaId: 9102,
      mediaType: MediaType.tv,
      title: 'Episode series',
      runtime: 47,
      watchedOn: '2026-09-12',
      seasonNumber: 2,
      episodeNumber: 3,
      eventRating: 8,
    });
    await seedEvent(owner, {
      mediaId: 9103,
      mediaType: MediaType.movie,
      watchedOn: null,
      createSnapshot: false,
    });
    await seedEvent(owner, {
      mediaId: 9101,
      mediaType: MediaType.movie,
      title: 'Rated movie',
      runtime: 118,
      watchedOn: '2026-09-10',
      userMediaRating: 9,
      note: 'First viewing.',
    });
    await seedEvent(owner, {
      mediaId: 9107,
      mediaType: MediaType.movie,
      title: 'Zero runtime movie',
      runtime: 0,
      watchedOn: '2026-09-11',
    });

    await seedEvent(owner, {
      mediaId: 9104,
      mediaType: MediaType.tv,
      watchedOn: '2023-01-01',
      seasonNumber: null,
      episodeNumber: null,
    });
    await seedEvent(owner, {
      mediaId: 9105,
      mediaType: MediaType.tv,
      seasonNumber: 1,
      episodeNumber: null,
    });
    await seedEvent(owner, {
      mediaId: 9106,
      mediaType: MediaType.movie,
      seasonNumber: 1,
      episodeNumber: 1,
    });
    await seedEvent(owner, {
      mediaId: 9108,
      mediaType: MediaType.movie,
      episodeId: 12345,
    });
    await seedEvent(otherUser, {
      mediaId: 9199,
      mediaType: MediaType.movie,
      title: 'Someone else movie',
      runtime: 200,
      watchedOn: '2024-01-01',
    });

    const response = await request(app)
      .get('/api/user-media/diary')
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(response.body).toMatchObject({
      summary: {
        totalEntries: 5,
        movieWatches: 4,
        episodeWatches: 1,
        uniqueTitles: 4,
        estimatedMinutes: 283,
        runtimeCoverage: {
          coveredEntries: 3,
          totalEntries: 5,
          ratio: 0.6,
        },
        dateCoverage: {
          coveredEntries: 4,
          totalEntries: 5,
          ratio: 0.8,
        },
      },
      availableYears: [2026],
      pagination: {
        page: 1,
        limit: 20,
        total: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0]).toMatchObject({
      media_id: 9101,
      media_type: 'movie',
      title: 'Rated movie',
      original_title: 'Rated movie original',
      poster_path: '/poster-9101.jpg',
      runtime: 118,
      watchedOn: '2026-09-13',
      rating: 9,
      note: 'Worth revisiting.',
      seasonNumber: null,
      episodeNumber: null,
    });
    expect(response.body.data[1]).toMatchObject({
      media_id: 9102,
      media_type: 'tv',
      title: 'Episode series',
      runtime: 47,
      watchedOn: '2026-09-12',
      rating: 8,
      seasonNumber: 2,
      episodeNumber: 3,
    });
    expect(response.body.data[2]).toMatchObject({
      media_id: 9107,
      runtime: 0,
      watchedOn: '2026-09-11',
    });
    expect(response.body.data[3]).toMatchObject({
      media_id: 9101,
      watchedOn: '2026-09-10',
      rating: 9,
      note: 'First viewing.',
    });
    expect(response.body.data[4]).toMatchObject({
      media_id: 9103,
      media_type: 'movie',
      title: 'Movie 9103',
      watchedOn: null,
      rating: null,
      runtime: null,
      poster_path: null,
    });
    const mediaIds = response.body.data.map((entry: { media_id: number }) => entry.media_id);
    expect(mediaIds).not.toContain(9108);
    expect(mediaIds).not.toContain(9199);
  });

  it('filters by media type, year, month, and exact UTC date while preserving all available years', async () => {
    const user = await registerTestUser('diary-filter-user');
    const app = await getTestApp();

    await seedEvent(user, {
      mediaId: 9201,
      mediaType: MediaType.movie,
      watchedOn: '2025-12-31',
    });
    await seedEvent(user, {
      mediaId: 9202,
      mediaType: MediaType.movie,
      watchedOn: '2026-09-01',
    });
    await seedEvent(user, {
      mediaId: 9203,
      mediaType: MediaType.tv,
      watchedOn: '2026-09-13',
      seasonNumber: 1,
      episodeNumber: 4,
    });
    await seedEvent(user, {
      mediaId: 9204,
      mediaType: MediaType.movie,
      watchedOn: '2026-10-01',
    });
    await seedEvent(user, {
      mediaId: 9205,
      mediaType: MediaType.movie,
      watchedOn: null,
    });

    const month = await request(app)
      .get('/api/user-media/diary')
      .query({ year: 2026, month: 9, mediaType: 'movie' })
      .set('Authorization', authorization(user))
      .expect(200);

    expect(month.body.data.map((entry: { media_id: number }) => entry.media_id)).toEqual([9202]);
    expect(month.body.summary).toMatchObject({
      totalEntries: 1,
      movieWatches: 1,
      episodeWatches: 0,
      dateCoverage: { coveredEntries: 1, totalEntries: 1, ratio: 1 },
    });
    expect(month.body.availableYears).toEqual([2026, 2025]);

    const year = await request(app)
      .get('/api/user-media/diary')
      .query({ year: 2026 })
      .set('Authorization', authorization(user))
      .expect(200);

    expect(year.body.data.map((entry: { media_id: number }) => entry.media_id)).toEqual([9204, 9203, 9202]);

    const day = await request(app)
      .get('/api/user-media/diary')
      .query({ date: '2026-09-13' })
      .set('Authorization', authorization(user))
      .expect(200);

    expect(day.body.data).toHaveLength(1);
    expect(day.body.data[0]).toMatchObject({
      media_id: 9203,
      watchedOn: '2026-09-13',
    });
  });

  it('orders recorded dates before undated events and paginates without changing the full-filter summary', async () => {
    const user = await registerTestUser('diary-pagination-user');
    const app = await getTestApp();

    await seedEvent(user, {
      mediaId: 9301,
      mediaType: MediaType.movie,
      watchedOn: '2026-09-12',
      watchedAt: '2026-09-14T08:00:00.000Z',
    });
    await seedEvent(user, {
      mediaId: 9302,
      mediaType: MediaType.movie,
      watchedOn: '2026-09-13',
      watchedAt: '2026-09-13T08:00:00.000Z',
    });
    await seedEvent(user, {
      mediaId: 9303,
      mediaType: MediaType.movie,
      watchedOn: '2026-09-13',
      watchedAt: '2026-09-13T09:00:00.000Z',
    });
    await seedEvent(user, {
      mediaId: 9304,
      mediaType: MediaType.movie,
      watchedOn: null,
      watchedAt: '2026-09-15T08:00:00.000Z',
    });
    await seedEvent(user, {
      mediaId: 9305,
      mediaType: MediaType.movie,
      watchedOn: null,
      watchedAt: '2026-09-14T08:00:00.000Z',
    });

    const firstPage = await request(app)
      .get('/api/user-media/diary')
      .query({ page: 1, limit: 2 })
      .set('Authorization', authorization(user))
      .expect(200);
    const secondPage = await request(app)
      .get('/api/user-media/diary')
      .query({ page: 2, limit: 2 })
      .set('Authorization', authorization(user))
      .expect(200);
    const thirdPage = await request(app)
      .get('/api/user-media/diary')
      .query({ page: 3, limit: 2 })
      .set('Authorization', authorization(user))
      .expect(200);

    expect(firstPage.body.data.map((entry: { media_id: number }) => entry.media_id)).toEqual([9303, 9302]);
    expect(secondPage.body.data.map((entry: { media_id: number }) => entry.media_id)).toEqual([9301, 9304]);
    expect(thirdPage.body.data.map((entry: { media_id: number }) => entry.media_id)).toEqual([9305]);
    expect(secondPage.body.summary.totalEntries).toBe(5);
    expect(secondPage.body.pagination).toMatchObject({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});

describe('viewing diary insights route', () => {
  it('validates the requested year and requires authentication', async () => {
    const user = await registerTestUser('diary-insights-validation-user');
    const app = await getTestApp();

    await request(app).get('/api/user-media/diary/insights').query({ year: 2026 }).expect(401);
    await request(app)
      .get('/api/user-media/diary/insights')
      .set('Authorization', authorization(user))
      .expect(400);
    await request(app)
      .get('/api/user-media/diary/insights')
      .query({ year: 2026, mediaType: 'person' })
      .set('Authorization', authorization(user))
      .expect(400);
  });

  it('returns deterministic daily and monthly aggregates with honest coverage', async () => {
    const owner = await registerTestUser('diary-insights-owner');
    const otherUser = await registerTestUser('diary-insights-other');
    const app = await getTestApp();

    await seedEvent(owner, {
      mediaId: 9401,
      mediaType: MediaType.movie,
      watchedOn: '2026-01-03',
      runtime: 100,
    });
    await seedEvent(owner, {
      mediaId: 9401,
      mediaType: MediaType.movie,
      watchedOn: '2026-01-03',
      runtime: 100,
    });
    await seedEvent(owner, {
      mediaId: 9402,
      mediaType: MediaType.tv,
      watchedOn: '2026-02-10',
      runtime: 45,
      seasonNumber: 1,
      episodeNumber: 2,
    });
    await seedEvent(owner, {
      mediaId: 9403,
      mediaType: MediaType.movie,
      watchedOn: '2026-02-10',
      runtime: null,
    });
    await seedEvent(owner, {
      mediaId: 9404,
      mediaType: MediaType.movie,
      watchedOn: null,
      runtime: 90,
    });
    await seedEvent(owner, {
      mediaId: 9405,
      mediaType: MediaType.movie,
      watchedOn: '2025-12-31',
      runtime: 80,
    });
    await seedEvent(owner, {
      mediaId: 9406,
      mediaType: MediaType.tv,
      watchedOn: '2026-03-01',
      seasonNumber: null,
      episodeNumber: null,
    });
    await seedEvent(otherUser, {
      mediaId: 9499,
      mediaType: MediaType.movie,
      watchedOn: '2026-01-03',
      runtime: 300,
    });

    const response = await request(app)
      .get('/api/user-media/diary/insights')
      .query({ year: 2026 })
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(response.body).toMatchObject({
      year: 2026,
      summary: {
        totalEntries: 4,
        movieWatches: 3,
        episodeWatches: 1,
        uniqueTitles: 3,
        estimatedMinutes: 245,
        runtimeCoverage: { coveredEntries: 3, totalEntries: 4, ratio: 0.75 },
        dateCoverage: { coveredEntries: 4, totalEntries: 4, ratio: 1 },
      },
      activeDays: 2,
      busiestDay: { date: '2026-01-03', totalEntries: 2 },
      dateCoverage: { coveredEntries: 5, totalEntries: 6, ratio: 5 / 6 },
      availableYears: [2026, 2025],
    });
    expect(response.body.monthly).toHaveLength(12);
    expect(response.body.monthly[0]).toMatchObject({
      month: 1,
      movieWatches: 2,
      episodeWatches: 0,
      totalEntries: 2,
      estimatedMinutes: 200,
      runtimeCoverage: { coveredEntries: 2, totalEntries: 2, ratio: 1 },
    });
    expect(response.body.monthly[1]).toMatchObject({
      month: 2,
      movieWatches: 1,
      episodeWatches: 1,
      totalEntries: 2,
      estimatedMinutes: 45,
      runtimeCoverage: { coveredEntries: 1, totalEntries: 2, ratio: 0.5 },
    });
    expect(response.body.monthly[2]).toMatchObject({
      month: 3,
      totalEntries: 0,
      estimatedMinutes: 0,
      runtimeCoverage: { coveredEntries: 0, totalEntries: 0, ratio: 0 },
    });
    expect(response.body.daily).toEqual([
      expect.objectContaining({
        date: '2026-01-03',
        movieWatches: 2,
        episodeWatches: 0,
        totalEntries: 2,
        estimatedMinutes: 200,
      }),
      expect.objectContaining({
        date: '2026-02-10',
        movieWatches: 1,
        episodeWatches: 1,
        totalEntries: 2,
        estimatedMinutes: 45,
      }),
    ]);
  });

  it('returns twelve empty months for a valid year without activity', async () => {
    const user = await registerTestUser('diary-insights-empty-user');
    const app = await getTestApp();
    await seedEvent(user, {
      mediaId: 9501,
      mediaType: MediaType.movie,
      watchedOn: '2025-01-01',
    });

    const response = await request(app)
      .get('/api/user-media/diary/insights')
      .query({ year: 2026 })
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      year: 2026,
      summary: { totalEntries: 0, estimatedMinutes: 0 },
      activeDays: 0,
      busiestDay: null,
      availableYears: [2025],
    });
    expect(response.body.daily).toEqual([]);
    expect(response.body.monthly).toHaveLength(12);
    expect(response.body.monthly.every((month: { totalEntries: number }) => month.totalEntries === 0)).toBe(true);
  });
});
