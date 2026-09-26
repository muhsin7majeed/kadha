import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tmdbClient = vi.hoisted(() => ({
  fetchMediaDetails: vi.fn(),
  fetchTvSeasonDetails: vi.fn(),
}));

vi.mock('@/features/media/tmdb.client', () => tmdbClient);

import { prisma } from '@/lib/prisma';
import {
  clearEpisodeWatched,
  getTvProgress,
  markAllAiredWatched,
  markEpisodeWatched,
  markNextEpisodeWatched,
  markSeasonWatched,
} from '@/features/user-media/tv-progress.service';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

const createProgressUser = (username: string) =>
  prisma.user.create({
    data: {
      username,
      password: 'test-password',
    },
  });

const createWatchlistedProgressUser = async (username: string, watchlistAt: Date) => {
  const user = await createProgressUser(username);

  await prisma.mediaSnapshot.create({
    data: {
      media_id: 887101,
      media_type: 'tv',
      title: 'Progress Show',
    },
  });
  await prisma.userMedia.create({
    data: {
      userId: user.id,
      media_id: 887101,
      media_type: 'tv',
      watchlist: true,
      watchlistAt,
    },
  });

  return user;
};

const unairedEpisodeDate = '2999-08-01';

const createTvDetails = () => ({
  adult: false,
  backdrop_path: null,
  created_by: [],
  episode_run_time: [45],
  first_air_date: '2026-01-01',
  genres: [{ id: 18, name: 'Drama' }],
  homepage: null,
  id: 887101,
  in_production: true,
  languages: ['en'],
  last_air_date: '2026-02-01',
  last_episode_to_air: {
    air_date: '2026-02-01',
    episode_number: 1,
    id: 201,
    name: 'Season two premiere',
    overview: '',
    production_code: '',
    runtime: 45,
    season_number: 2,
    show_id: 887101,
    still_path: null,
    vote_average: 0,
    vote_count: 0,
  },
  name: 'Progress Show',
  networks: [],
  next_episode_to_air: {
    air_date: unairedEpisodeDate,
    episode_number: 2,
    id: 202,
    name: 'Future episode',
    overview: '',
    production_code: '',
    runtime: 45,
    season_number: 2,
    show_id: 887101,
    still_path: null,
    vote_average: 0,
    vote_count: 0,
  },
  number_of_episodes: 5,
  number_of_seasons: 2,
  origin_country: ['US'],
  original_language: 'en',
  original_name: 'Progress Show',
  overview: 'A mocked TV show.',
  popularity: 10,
  poster_path: null,
  production_companies: [],
  production_countries: [],
  seasons: [
    {
      air_date: '2026-01-01',
      episode_count: 3,
      id: 1,
      name: 'Season 1',
      overview: '',
      poster_path: null,
      season_number: 1,
      vote_average: 0,
    },
    {
      air_date: '2026-02-01',
      episode_count: 2,
      id: 2,
      name: 'Season 2',
      overview: '',
      poster_path: null,
      season_number: 2,
      vote_average: 0,
    },
  ],
  spoken_languages: [],
  status: 'Returning Series',
  still_path: null,
  tagline: null,
  type: 'Scripted',
  vote_average: 8,
  vote_count: 100,
});

const createSeasonDetails = (seasonNumber: number) => ({
  air_date: seasonNumber === 1 ? '2026-01-01' : '2026-02-01',
  episodes:
    seasonNumber === 1
      ? [1, 2, 3].map((episodeNumber) => ({
          air_date: `2026-01-0${episodeNumber}`,
          episode_number: episodeNumber,
          id: 100 + episodeNumber,
          name: `Episode ${episodeNumber}`,
          overview: '',
          runtime: 45,
          season_number: 1,
          still_path: null,
          vote_average: 0,
          vote_count: 0,
        }))
      : [
          {
            air_date: '2026-02-01',
            episode_number: 1,
            id: 201,
            name: 'Season two premiere',
            overview: '',
            runtime: 45,
            season_number: 2,
            still_path: null,
            vote_average: 0,
            vote_count: 0,
          },
          {
            air_date: unairedEpisodeDate,
            episode_number: 2,
            id: 202,
            name: 'Future episode',
            overview: '',
            runtime: 45,
            season_number: 2,
            still_path: null,
            vote_average: 0,
            vote_count: 0,
          },
        ],
  id: seasonNumber,
  name: `Season ${seasonNumber}`,
  overview: '',
  poster_path: null,
  season_number: seasonNumber,
});

beforeEach(() => {
  vi.clearAllMocks();
  tmdbClient.fetchMediaDetails.mockResolvedValue(createTvDetails());
  tmdbClient.fetchTvSeasonDetails.mockImplementation((_mediaId: number, seasonNumber: number) =>
    Promise.resolve(createSeasonDetails(seasonNumber)),
  );
});

describe('TV progress service', () => {
  it('derives plan-to-watch progress from watchlist state', async () => {
    const user = await createProgressUser('tv-plan-user');

    await prisma.mediaSnapshot.create({
      data: {
        media_id: 887101,
        media_type: 'tv',
        title: 'Progress Show',
      },
    });
    await prisma.userMedia.create({
      data: {
        userId: user.id,
        media_id: 887101,
        media_type: 'tv',
        watchlist: true,
      },
    });

    const progress = await getTvProgress(user.id, '887101');

    expect(progress).toMatchObject({
      status: 'plan_to_watch',
      watchedEpisodeCount: 0,
      totalAiredEpisodeCount: 4,
      nextEpisode: {
        seasonNumber: 1,
        episodeNumber: 1,
        name: 'Episode 1',
      },
    });
  });

  it('marks the next episode watched without changing watchlist state', async () => {
    const watchlistAt = new Date('2026-01-10T12:00:00.000Z');
    const user = await createWatchlistedProgressUser('tv-next-user', watchlistAt);

    const progress = await markNextEpisodeWatched(user.id, '887101');
    const userMedia = await prisma.userMedia.findUnique({
      where: {
        userId_media_id_media_type: {
          userId: user.id,
          media_id: 887101,
          media_type: 'tv',
        },
      },
    });

    expect(progress).toMatchObject({
      status: 'in_progress',
      watchedEpisodeCount: 1,
      selectedSeason: {
        seasonNumber: 1,
      },
    });
    expect(progress.selectedSeason?.episodes[0]).toMatchObject({
      episodeNumber: 1,
      watched: true,
    });
    expect(userMedia).toMatchObject({
      watchlist: true,
      watchlistAt,
    });
  });

  it.each([
    ['season', (userId: string) => markSeasonWatched(userId, '887101', '1')],
    ['all aired episodes', (userId: string) => markAllAiredWatched(userId, '887101')],
  ])('marks %s watched without changing watchlist state', async (_label, markWatched) => {
    const watchlistAt = new Date('2026-01-11T12:00:00.000Z');
    const user = await createWatchlistedProgressUser(`tv-bulk-${_label.replaceAll(' ', '-')}-user`, watchlistAt);

    await markWatched(user.id);

    const userMedia = await prisma.userMedia.findUniqueOrThrow({
      where: {
        userId_media_id_media_type: {
          userId: user.id,
          media_id: 887101,
          media_type: 'tv',
        },
      },
    });

    expect(userMedia).toMatchObject({
      watchlist: true,
      watchlistAt,
    });
  });

  it('marks only aired episodes for a season', async () => {
    const user = await createProgressUser('tv-season-user');

    const progress = await markSeasonWatched(user.id, '887101', '2');
    const rows = await prisma.watchEvent.findMany({
      where: {
        userId: user.id,
        media_id: 887101,
        seasonNumber: 2,
      },
      orderBy: {
        episodeNumber: 'asc',
      },
    });

    expect(rows.map((row) => row.episodeNumber)).toEqual([1]);
    expect(progress).toMatchObject({
      watchedEpisodeCount: 1,
      selectedSeason: {
        seasonNumber: 2,
      },
    });
  });

  it('rejects unaired episodes', async () => {
    const user = await createProgressUser('tv-unaired-user');

    await expect(
      markEpisodeWatched(user.id, '887101', {
        seasonNumber: 2,
        episodeNumber: 2,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Episode has not aired yet',
    });
  });

  it('does not clear another user episode row', async () => {
    const owner = await createProgressUser('tv-owner-user');
    const viewer = await createProgressUser('tv-viewer-user');

    await markEpisodeWatched(owner.id, '887101', {
      seasonNumber: 1,
      episodeNumber: 1,
      note: 'Private episode note.',
      rating: 8,
    });
    await clearEpisodeWatched(viewer.id, '887101', '1', '1');

    const rows = await prisma.watchEvent.findMany({
      where: {
        userId: owner.id,
        media_id: 887101,
      },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      note: 'Private episode note.',
      rating: 8,
    });
  });

  const createCaughtUpListUser = async (username: string) => {
    const user = await registerTestUser(username);
    await markAllAiredWatched(user.userId, '887101');
    vi.clearAllMocks();
    return user;
  };

  const optInToCaughtUpFiltering = (userId: string) =>
    prisma.trackingPreferences.create({
      data: {
        userId,
        config: JSON.stringify({
          version: 1,
          keepWatchedOnWatchlist: false,
          hideCaughtUpWithoutScheduledNext: true,
        }),
      },
    });

  it('lists current user in-progress TV shows with next episode metadata when caught-up filtering is enabled', async () => {
    const user = await registerTestUser('tv-progress-list-user');

    await markNextEpisodeWatched(user.userId, '887101');
    await optInToCaughtUpFiltering(user.userId);
    vi.clearAllMocks();

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=next&page=1&limit=1')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      access: {
        canView: true,
      },
      pagination: {
        page: 1,
        limit: 1,
        total: 1,
      },
      data: [
        {
          media_id: 887101,
          media_type: 'tv',
          title: 'Progress Show',
          tvProgress: {
            status: 'in_progress',
            watchedEpisodeCount: 1,
            totalAiredEpisodeCount: 4,
            nextEpisode: {
              seasonNumber: 1,
              episodeNumber: 2,
              name: 'Episode 2',
            },
            lastWatchedAt: expect.any(String),
          },
        },
      ],
    });
    expect(tmdbClient.fetchMediaDetails).toHaveBeenCalledTimes(1);
    expect(tmdbClient.fetchTvSeasonDetails).toHaveBeenCalledTimes(1);
  });

  it('includes caught-up ongoing shows with no schedule by default', async () => {
    const user = await createCaughtUpListUser('tv-caught-up-default-list-user');
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      ...createTvDetails(),
      next_episode_to_air: null,
    });

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=recent&page=1&limit=10')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      pagination: {
        total: 1,
      },
      data: [
        {
          media_id: 887101,
          tvProgress: {
            status: 'caught_up',
            watchedEpisodeCount: 4,
            totalAiredEpisodeCount: 4,
            nextEpisode: null,
          },
        },
      ],
    });
  });

  it('hides caught-up ongoing shows with no schedule when opted in', async () => {
    const user = await createCaughtUpListUser('tv-caught-up-filtered-list-user');
    await optInToCaughtUpFiltering(user.userId);
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      ...createTvDetails(),
      next_episode_to_air: null,
    });

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=recent&page=1&limit=10')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      pagination: {
        total: 0,
      },
      data: [],
    });
    expect(tmdbClient.fetchMediaDetails).toHaveBeenCalledTimes(1);
    expect(tmdbClient.fetchTvSeasonDetails).not.toHaveBeenCalled();
  });

  it.each([
    ['today', new Date().toISOString().slice(0, 10)],
    ['in the future', unairedEpisodeDate],
  ])('keeps caught-up shows with a next episode dated %s when opted in', async (label, airDate) => {
    const user = await createCaughtUpListUser(`tv-caught-up-${label.replaceAll(' ', '-')}-list-user`);
    await optInToCaughtUpFiltering(user.userId);
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      ...createTvDetails(),
      next_episode_to_air: {
        ...createTvDetails().next_episode_to_air!,
        air_date: airDate,
      },
    });

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=next&page=1&limit=10')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      pagination: {
        total: 1,
      },
      data: [
        {
          media_id: 887101,
          tvProgress: {
            status: 'caught_up',
            nextEpisode: null,
          },
        },
      ],
    });
  });

  it('hides caught-up shows with an undated next-episode placeholder when opted in', async () => {
    const user = await createCaughtUpListUser('tv-caught-up-undated-list-user');
    await optInToCaughtUpFiltering(user.userId);
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      ...createTvDetails(),
      next_episode_to_air: {
        ...createTvDetails().next_episode_to_air!,
        air_date: null,
      },
    });

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=recent&page=1&limit=10')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      pagination: {
        total: 0,
      },
      data: [],
    });
  });

  it('still excludes ended shows when caught-up filtering is enabled', async () => {
    const user = await createCaughtUpListUser('tv-completed-list-user');
    await optInToCaughtUpFiltering(user.userId);
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      ...createTvDetails(),
      in_production: false,
      next_episode_to_air: null,
      status: 'Ended',
    });

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=recent&page=1&limit=10')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      pagination: {
        total: 0,
      },
      data: [],
    });
  });

  it('documents that a stale show summary can still hide a newly aired episode without another season request', async () => {
    const user = await createCaughtUpListUser('tv-stale-summary-list-user');
    await optInToCaughtUpFiltering(user.userId);
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      ...createTvDetails(),
      next_episode_to_air: null,
    });
    tmdbClient.fetchTvSeasonDetails.mockResolvedValue({
      ...createSeasonDetails(2),
      episodes: createSeasonDetails(2).episodes.map((episode) =>
        episode.episode_number === 2 ? { ...episode, air_date: new Date().toISOString().slice(0, 10) } : episode,
      ),
    });

    const response = await request(await getTestApp())
      .get('/api/user/in-progress?sort=recent&page=1&limit=10')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      pagination: {
        total: 0,
      },
      data: [],
    });
    expect(tmdbClient.fetchMediaDetails).toHaveBeenCalledTimes(1);
    expect(tmdbClient.fetchTvSeasonDetails).not.toHaveBeenCalled();
  });
});
