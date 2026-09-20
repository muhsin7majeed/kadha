import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tmdbClient = vi.hoisted(() => ({
  fetchMediaDetails: vi.fn(),
  fetchTvSeasonDetails: vi.fn(),
}));

vi.mock('@/features/media/tmdb.client', () => tmdbClient);

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

const range = '?from=2999-01-01&to=2999-01-31';

const createMovieDetails = (id: number, releaseDate = '2999-01-15') => ({
  adult: false,
  backdrop_path: null,
  belongs_to_collection: null,
  budget: 0,
  genres: [{ id: 18, name: 'Drama' }],
  homepage: null,
  id,
  imdb_id: null,
  original_language: 'en',
  original_title: `Movie ${id}`,
  overview: `Movie ${id} overview`,
  popularity: 1,
  poster_path: null,
  production_companies: [],
  production_countries: [],
  release_date: releaseDate,
  revenue: 0,
  runtime: 100,
  spoken_languages: [],
  status: 'Post Production',
  tagline: null,
  title: `Movie ${id}`,
  video: false,
  vote_average: 7,
  vote_count: 10,
});

const createTvDetails = (id: number, date = '2999-01-10', seasonNumber = 1) => ({
  adult: false,
  backdrop_path: null,
  created_by: [],
  episode_run_time: [45],
  first_air_date: '2990-01-01',
  genres: [{ id: 18, name: 'Drama' }],
  homepage: null,
  id,
  in_production: true,
  languages: ['en'],
  last_air_date: '2998-12-01',
  last_episode_to_air: null,
  name: `Show ${id}`,
  networks: [],
  next_episode_to_air: {
    air_date: date,
    episode_number: 1,
    id: id * 100 + 1,
    name: 'Premiere',
    overview: '',
    production_code: '',
    runtime: 45,
    season_number: seasonNumber,
    show_id: id,
    still_path: null,
    vote_average: 0,
    vote_count: 0,
  },
  number_of_episodes: 2,
  number_of_seasons: 1,
  origin_country: ['US'],
  original_language: 'en',
  original_name: `Show ${id}`,
  overview: `Show ${id} overview`,
  popularity: 1,
  poster_path: null,
  production_companies: [],
  production_countries: [],
  seasons: [],
  spoken_languages: [],
  status: 'Returning Series',
  tagline: null,
  type: 'Scripted',
  vote_average: 8,
  vote_count: 20,
});

const createEpisode = (showId: number, episodeNumber: number, airDate: string) => ({
  air_date: airDate,
  episode_number: episodeNumber,
  id: showId * 100 + episodeNumber,
  name: `Episode ${episodeNumber}`,
  overview: '',
  runtime: 45,
  season_number: 1,
  still_path: null,
  vote_average: 0,
  vote_count: 0,
});

const createSnapshot = (mediaId: number, mediaType: 'movie' | 'tv') =>
  prisma.mediaSnapshot.create({
    data: {
      media_id: mediaId,
      media_type: mediaType,
      title: `${mediaType} ${mediaId}`,
    },
  });

beforeEach(() => {
  vi.clearAllMocks();
  tmdbClient.fetchMediaDetails.mockImplementation((mediaType: 'movie' | 'tv', id: number) =>
    Promise.resolve(mediaType === 'movie' ? createMovieDetails(id) : createTvDetails(id)),
  );
  tmdbClient.fetchTvSeasonDetails.mockImplementation((showId: number) =>
    Promise.resolve({
      air_date: '2999-01-10',
      episodes: [createEpisode(showId, 1, '2999-01-10')],
      id: showId,
      name: 'Season 1',
      overview: '',
      poster_path: null,
      season_number: 1,
    }),
  );
});

describe('upcoming tracked schedule', () => {
  it('requires authentication', async () => {
    await request(await getTestApp()).get(`/api/upcoming${range}`).expect(401);
  });

  it('uses the owner tracking union, groups same-day episodes, and excludes unrelated media', async () => {
    const owner = await registerTestUser('upcoming-owner');
    const other = await registerTestUser('upcoming-other');
    const trackedTv = [101, 102, 103];

    await Promise.all([
      ...[...trackedTv, 105, 106].map((id) => createSnapshot(id, 'tv')),
      ...[201, 202].map((id) => createSnapshot(id, 'movie')),
    ]);
    await prisma.userMedia.createMany({
      data: [
        { userId: owner.userId, media_id: 101, media_type: 'tv', watchlist: true },
        { userId: owner.userId, media_id: 102, media_type: 'tv', watched: true },
        { userId: owner.userId, media_id: 103, media_type: 'tv', liked: true },
        { userId: owner.userId, media_id: 105, media_type: 'tv' },
        { userId: owner.userId, media_id: 201, media_type: 'movie', watchlist: true },
        { userId: owner.userId, media_id: 202, media_type: 'movie', liked: true },
        { userId: other.userId, media_id: 106, media_type: 'tv', watchlist: true },
      ],
    });
    await createSnapshot(104, 'tv');
    await prisma.watchEvent.create({
      data: {
        userId: owner.userId,
        media_id: 104,
        media_type: 'tv',
        seasonNumber: 1,
        episodeNumber: 1,
      },
    });
    tmdbClient.fetchTvSeasonDetails.mockImplementation((showId: number) =>
      Promise.resolve({
        air_date: '2999-01-10',
        episodes:
          showId === 101
            ? [createEpisode(showId, 2, '2999-01-10'), createEpisode(showId, 1, '2999-01-10')]
            : [createEpisode(showId, 1, '2999-01-10')],
        id: showId,
        name: 'Season 1',
        overview: '',
        poster_path: null,
        season_number: 1,
      }),
    );

    const response = await request(await getTestApp())
      .get(`/api/upcoming${range}`)
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(response.body.data.coverage).toEqual({ trackedTitles: 5, resolvedTitles: 5, failedTitles: 0 });
    expect(response.body.data.entries).toHaveLength(5);
    expect(response.body.data.entries[0]).toMatchObject({
      kind: 'episode-release',
      date: '2999-01-10',
      media: { media_id: 101, media_type: 'tv', title: 'Show 101' },
      episodes: [
        { seasonNumber: 1, episodeNumber: 1, name: 'Episode 1' },
        { seasonNumber: 1, episodeNumber: 2, name: 'Episode 2' },
      ],
    });
    expect(response.body.data.entries.at(-1)).toMatchObject({
      kind: 'movie-release',
      date: '2999-01-15',
      media: { media_id: 201, media_type: 'movie', title: 'Movie 201' },
    });
    expect(tmdbClient.fetchMediaDetails.mock.calls.map((call) => call[1]).sort()).toEqual([
      101, 102, 103, 104, 201,
    ]);
  });

  it('orders same-day entries by stable media identity instead of provider title', async () => {
    const user = await registerTestUser('upcoming-order');
    await Promise.all([createSnapshot(501, 'movie'), createSnapshot(502, 'movie')]);
    await prisma.userMedia.createMany({
      data: [
        { userId: user.userId, media_id: 501, media_type: 'movie', watchlist: true },
        { userId: user.userId, media_id: 502, media_type: 'movie', watchlist: true },
      ],
    });
    tmdbClient.fetchMediaDetails.mockImplementation((_mediaType: 'movie' | 'tv', id: number) =>
      Promise.resolve({
        ...createMovieDetails(id),
        original_title: id === 501 ? 'Zulu' : 'Alpha',
        title: id === 501 ? 'Zulu' : 'Alpha',
      }),
    );

    const response = await request(await getTestApp())
      .get(`/api/upcoming${range}`)
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.entries.map((entry: { media: { media_id: number } }) => entry.media.media_id)).toEqual([
      501, 502,
    ]);
  });

  it('validates date ranges and keeps inclusive boundaries while excluding specials', async () => {
    const user = await registerTestUser('upcoming-range');
    await Promise.all([createSnapshot(301, 'tv'), createSnapshot(302, 'tv')]);
    await prisma.userMedia.createMany({
      data: [
        { userId: user.userId, media_id: 301, media_type: 'tv', watchlist: true },
        { userId: user.userId, media_id: 302, media_type: 'tv', watchlist: true },
      ],
    });
    tmdbClient.fetchMediaDetails.mockImplementation((_mediaType: 'movie' | 'tv', id: number) =>
      Promise.resolve(createTvDetails(id, '2999-01-01', id === 302 ? 0 : 1)),
    );
    tmdbClient.fetchTvSeasonDetails.mockResolvedValue({
      air_date: '2999-01-01',
      episodes: [
        createEpisode(301, 1, '2998-12-31'),
        createEpisode(301, 2, '2999-01-01'),
        createEpisode(301, 3, '2999-01-31'),
        createEpisode(301, 4, '2999-02-01'),
      ],
      id: 301,
      name: 'Season 1',
      overview: '',
      poster_path: null,
      season_number: 1,
    });

    const response = await request(await getTestApp())
      .get(`/api/upcoming${range}`)
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.entries).toHaveLength(2);
    expect(response.body.data.entries.map((entry: { date: string }) => entry.date)).toEqual([
      '2999-01-01',
      '2999-01-31',
    ]);
    expect(tmdbClient.fetchTvSeasonDetails).toHaveBeenCalledTimes(1);

    const app = await getTestApp();
    const auth = authorization(user);
    await request(app).get('/api/upcoming?from=2999-01-02&to=2999-01-01').set('Authorization', auth).expect(400);
    await request(app).get('/api/upcoming?from=2999-01-01&to=2999-04-03').set('Authorization', auth).expect(400);
    await request(app).get('/api/upcoming?from=2999-02-30&to=2999-03-01').set('Authorization', auth).expect(400);
  });

  it('returns partial coverage and fails only when every tracked title resolution fails', async () => {
    const user = await registerTestUser('upcoming-failures');
    await Promise.all([createSnapshot(401, 'tv'), createSnapshot(402, 'tv')]);
    await prisma.userMedia.createMany({
      data: [
        { userId: user.userId, media_id: 401, media_type: 'tv', liked: true },
        { userId: user.userId, media_id: 402, media_type: 'tv', liked: true },
      ],
    });
    tmdbClient.fetchMediaDetails.mockImplementation((_mediaType: 'movie' | 'tv', id: number) =>
      id === 402 ? Promise.reject(new Error('provider unavailable')) : Promise.resolve(createTvDetails(id)),
    );

    const partial = await request(await getTestApp())
      .get(`/api/upcoming${range}`)
      .set('Authorization', authorization(user))
      .expect(200);

    expect(partial.body.data.coverage).toEqual({ trackedTitles: 2, resolvedTitles: 1, failedTitles: 1 });
    expect(partial.body.data.entries).toHaveLength(1);

    tmdbClient.fetchMediaDetails.mockRejectedValue(new Error('provider unavailable'));

    await request(await getTestApp())
      .get(`/api/upcoming${range}`)
      .set('Authorization', authorization(user))
      .expect(502);
  });
});
