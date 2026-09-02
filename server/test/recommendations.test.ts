import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tmdbClient = vi.hoisted(() => ({
  fetchMediaRecommendations: vi.fn(),
  fetchPopularMovies: vi.fn(),
  fetchPopularTvs: vi.fn(),
  fetchTopRatedMovies: vi.fn(),
  fetchTopRatedTvs: vi.fn(),
}));

vi.mock('@/features/media/tmdb.client', () => tmdbClient);

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser, TestUser } from './helpers/auth';
import { updateUserMediaFlag } from './helpers/user-media';

const movie = (id: number, genreIds: number[] = [18], title = `Candidate ${id}`) => ({
  adult: false,
  backdrop_path: null,
  genre_ids: genreIds,
  id,
  original_language: 'en',
  overview: `Overview ${id}`,
  popularity: 20,
  poster_path: null,
  vote_average: 8,
  vote_count: 100,
  original_title: title,
  release_date: '2026-03-01',
  title,
  video: false,
});

const emptyMovieResponse = {
  page: 1,
  total_pages: 1,
  total_results: 0,
  results: [],
};

const emptyTvResponse = {
  page: 1,
  total_pages: 1,
  total_results: 0,
  results: [],
};

const seedGenres = async () => {
  await prisma.genre.createMany({
    data: [
      { id: 18, name: 'Drama' },
      { id: 27, name: 'Horror' },
      { id: 53, name: 'Thriller' },
    ],
  });
};

const mockCandidatePools = (candidates = [movie(890901, [18])]) => {
  tmdbClient.fetchMediaRecommendations.mockResolvedValue({
    page: 1,
    total_pages: 1,
    total_results: candidates.length,
    results: candidates,
  });
  tmdbClient.fetchTopRatedMovies.mockResolvedValue(emptyMovieResponse);
  tmdbClient.fetchTopRatedTvs.mockResolvedValue(emptyTvResponse);
  tmdbClient.fetchPopularMovies.mockResolvedValue(emptyMovieResponse);
  tmdbClient.fetchPopularTvs.mockResolvedValue(emptyTvResponse);
};

const getRecommendations = async (user: TestUser) => {
  const response = await request(await getTestApp())
    .get('/api/recommendations')
    .set('Authorization', authorization(user))
    .expect(200);

  return response.body.data;
};

describe('recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCandidatePools();
  });

  it('manages recommendation settings and separate reset controls', async () => {
    const user = await registerTestUser('recommendation-settings');

    const defaults = await request(await getTestApp())
      .get('/api/recommendations/settings')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(defaults.body.data).toEqual({
      useLiked: true,
      useRatings: true,
      useWatched: true,
      useRewatchHistory: true,
      useWatchlist: false,
      excludeWatched: true,
    });

    const updated = await request(await getTestApp())
      .put('/api/recommendations/settings')
      .set('Authorization', authorization(user))
      .send({ useWatchlist: true, useWatched: false })
      .expect(200);

    expect(updated.body.data).toMatchObject({ useWatchlist: true, useWatched: false });

    await request(await getTestApp())
      .post('/api/recommendations/settings/reset')
      .set('Authorization', authorization(user))
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toMatchObject({ useWatchlist: false, useWatched: true });
      });
  });

  it('keeps one user recommendation signals from affecting another user', async () => {
    await seedGenres();
    const owner = await registerTestUser('recommendation-owner');
    const otherUser = await registerTestUser('recommendation-other');

    await updateUserMediaFlag(owner, 'liked', true, 890101);

    const ownerRecommendations = await getRecommendations(owner);
    const otherRecommendations = await getRecommendations(otherUser);

    expect(ownerRecommendations.status).toBe('READY');
    expect(ownerRecommendations.items).toHaveLength(1);
    expect(otherRecommendations).toMatchObject({
      status: 'NO_SIGNALS',
      items: [],
      signalCounts: {
        liked: 0,
        rated: 0,
        watched: 0,
        rewatched: 0,
        watchlisted: 0,
      },
    });
  });

  it('excludes watched results but still returns watchlisted unwatched recommendations', async () => {
    await seedGenres();
    const user = await registerTestUser('recommendation-watchlist');

    await updateUserMediaFlag(user, 'liked', true, 890201);
    await updateUserMediaFlag(user, 'watched', true, 890901);
    await updateUserMediaFlag(user, 'watchlist', true, 890902);
    mockCandidatePools([movie(890901, [18], 'Already watched'), movie(890902, [18], 'Already watchlisted')]);

    const recommendations = await getRecommendations(user);

    expect(recommendations.items.map((item: { media: { media_id: number } }) => item.media.media_id)).toEqual([890902]);
    expect(recommendations.items[0].media.watchlist).toBe(true);
    expect(recommendations.items[0].media.watched).toBe(false);
  });

  it('uses watchlist only when enabled as an input signal', async () => {
    await seedGenres();
    const user = await registerTestUser('recommendation-watchlist-signal');

    await updateUserMediaFlag(user, 'watchlist', true, 890301);

    const defaultRecommendations = await getRecommendations(user);

    expect(defaultRecommendations.status).toBe('NO_SIGNALS');
    expect(tmdbClient.fetchMediaRecommendations).not.toHaveBeenCalled();

    await request(await getTestApp())
      .put('/api/recommendations/settings')
      .set('Authorization', authorization(user))
      .send({ useWatchlist: true })
      .expect(200);

    const enabledRecommendations = await getRecommendations(user);

    expect(enabledRecommendations.status).toBe('READY');
    expect(enabledRecommendations.items).toHaveLength(1);
  });

  it('lets low ratings and private feedback reduce related recommendations for only that user', async () => {
    await seedGenres();
    const user = await registerTestUser('recommendation-feedback-user');
    const otherUser = await registerTestUser('recommendation-feedback-other');

    await updateUserMediaFlag(user, 'liked', true, 890401);
    await updateUserMediaFlag(user, 'watched', true, 890402, { rating: 1 });
    await updateUserMediaFlag(otherUser, 'liked', true, 890401);
    mockCandidatePools([movie(890903, [18], 'Drama match')]);

    const userRecommendations = await getRecommendations(user);
    const otherRecommendations = await getRecommendations(otherUser);

    expect(userRecommendations.items[0].score).toBeLessThan(otherRecommendations.items[0].score);

    await request(await getTestApp())
      .post('/api/recommendations/feedback')
      .set('Authorization', authorization(user))
      .send({
        media_id: 890903,
        media_type: 'movie',
        type: 'LESS_LIKE_THIS',
        title: 'Drama match',
        original_title: 'Drama match',
        overview: 'Feedback candidate',
        poster_path: null,
        backdrop_path: null,
        vote_average: 8,
        vote_count: 100,
        popularity: 20,
        adult: false,
        genre_ids: [18],
        release_date: '2026-03-01',
        original_language: 'en',
      })
      .expect(200);

    const reducedRecommendations = await getRecommendations(user);
    const otherUserAfterFeedback = await getRecommendations(otherUser);

    expect(reducedRecommendations.items[0].score).toBeLessThan(userRecommendations.items[0].score);
    expect(otherUserAfterFeedback.items[0].score).toBe(otherRecommendations.items[0].score);

    await request(await getTestApp())
      .post('/api/recommendations/feedback')
      .set('Authorization', authorization(user))
      .send({ media_id: 890903, media_type: 'movie', type: 'HIDE' })
      .expect(200);

    const hiddenRecommendations = await getRecommendations(user);

    expect(hiddenRecommendations.items).toHaveLength(0);
    expect(hiddenRecommendations.status).toBe('NO_RESULTS');

    await request(await getTestApp())
      .post('/api/recommendations/feedback/reset')
      .set('Authorization', authorization(user))
      .expect(200);

    const resetRecommendations = await getRecommendations(user);

    expect(resetRecommendations.items).toHaveLength(1);
  });
});
