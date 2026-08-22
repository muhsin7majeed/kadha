import { User } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tmdbClient = vi.hoisted(() => ({
  fetchMediaDetails: vi.fn(),
  fetchMovieGenres: vi.fn(),
  fetchPopularMovies: vi.fn(),
  fetchPopularTvs: vi.fn(),
  fetchTopRatedMovies: vi.fn(),
  fetchTopRatedTvs: vi.fn(),
  fetchTrendingMovies: vi.fn(),
  fetchTrendingTvs: vi.fn(),
  fetchTvGenres: vi.fn(),
  fetchWatchProviders: vi.fn(),
  searchMediaByType: vi.fn(),
}));

vi.mock('@/features/media/tmdb.client', () => tmdbClient);

import { prisma } from '@/lib/prisma';
import * as mediaService from '@/features/media/media.service';

const createMediaUser = async (username: string, watchRegion = 'US') => {
  return prisma.user.create({
    data: {
      username,
      password: 'test-password',
      watchRegion,
    },
  });
};

const createMovie = (id: number) => ({
  adult: false,
  backdrop_path: null,
  genre_ids: [18],
  id,
  original_language: 'en',
  overview: `Overview ${id}`,
  popularity: 20,
  poster_path: null,
  vote_average: 8,
  vote_count: 100,
  original_title: `Movie ${id}`,
  release_date: '2026-03-01',
  title: `Movie ${id}`,
  video: false,
});

const createMovieDetails = (id: number) => ({
  ...createMovie(id),
  belongs_to_collection: null,
  budget: 100,
  genres: [{ id: 18, name: 'Drama' }],
  homepage: null,
  imdb_id: null,
  production_companies: [],
  production_countries: [],
  revenue: 200,
  runtime: 120,
  spoken_languages: [],
  status: 'Released',
  tagline: null,
});

const createTv = (id: number) => ({
  adult: false,
  backdrop_path: null,
  genre_ids: [10759],
  id,
  original_language: 'en',
  overview: `Overview ${id}`,
  popularity: 15,
  poster_path: null,
  vote_average: 7,
  vote_count: 50,
  first_air_date: '2026-03-01',
  name: `TV ${id}`,
  original_name: `TV ${id}`,
});

const createInteraction = async (
  user: User,
  mediaId: number,
  flags: Partial<{ liked: boolean; watched: boolean; watchlist: boolean }>,
) => {
  await prisma.mediaSnapshot.create({
    data: {
      media_id: mediaId,
      media_type: 'movie',
      title: `Movie ${mediaId}`,
      genre_ids: JSON.stringify([18]),
    },
  });

  return prisma.userMedia.create({
    data: {
      userId: user.id,
      media_id: mediaId,
      media_type: 'movie',
      ...flags,
    },
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('media service', () => {
  it('enriches TMDB movie lists with current user interaction state', async () => {
    const user = await createMediaUser('media-list-user');

    await createInteraction(user, 886101, { liked: true });
    await prisma.watchEvent.createMany({
      data: [
        { userId: user.id, media_id: 886101, media_type: 'movie' },
        { userId: user.id, media_id: 886101, media_type: 'movie' },
      ],
    });
    tmdbClient.fetchTrendingMovies.mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [createMovie(886101)],
    });

    const movies = await mediaService.getTrendingMovies(user.id);

    expect(movies).toEqual([
      expect.objectContaining({
        media_id: 886101,
        media_type: 'movie',
        title: 'Movie 886101',
        liked: true,
        watched: false,
        watchlist: false,
        watchCount: 2,
      }),
    ]);
  });

  it('returns empty search results without calling TMDB for blank queries', async () => {
    const user = await createMediaUser('blank-search-user');

    const result = await mediaService.searchMedia(user.id, 'movie', '   ', 1);

    expect(result).toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(tmdbClient.searchMediaByType).not.toHaveBeenCalled();
  });

  it('enriches media details with interaction state and validates media params', async () => {
    const user = await createMediaUser('media-details-user');

    await createInteraction(user, 886201, { watched: true });
    await prisma.watchEvent.create({ data: { userId: user.id, media_id: 886201, media_type: 'movie' } });
    tmdbClient.fetchMediaDetails.mockResolvedValue(createMovieDetails(886201));

    const details = await mediaService.getMediaDetails(user.id, 'movie', '886201');

    expect(details).toMatchObject({
      media_id: 886201,
      media_type: 'movie',
      watched: true,
      liked: false,
      watchlist: false,
      title: 'Movie 886201',
      watchCount: 1,
    });

    await expect(mediaService.getMediaDetails(user.id, 'book', '886201')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Media type must be either movie or tv',
    });
    await expect(mediaService.getMediaDetails(user.id, 'movie', 'not-a-number')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Media ID must be a positive integer',
    });
  });

  it('normalizes watch providers using the user watch region', async () => {
    const user = await createMediaUser('watch-provider-user', 'GB');

    tmdbClient.fetchWatchProviders.mockResolvedValue({
      id: 886301,
      results: {
        GB: {
          link: 'https://providers.example/gb',
          flatrate: [
            {
              provider_id: 2,
              provider_name: 'Second Streamer',
              logo_path: '/second.png',
              display_priority: 2,
            },
            {
              provider_id: 1,
              provider_name: 'First Streamer',
              logo_path: null,
              display_priority: 1,
            },
          ],
        },
      },
    });

    const providers = await mediaService.getWatchProviders(user.id, 'movie', '886301');

    expect(providers).toEqual({
      region: {
        code: 'GB',
        name: 'United Kingdom',
      },
      link: 'https://providers.example/gb',
      providers: {
        stream: [
          {
            id: 1,
            name: 'First Streamer',
            logoUrl: null,
            displayPriority: 1,
          },
          {
            id: 2,
            name: 'Second Streamer',
            logoUrl: 'https://image.tmdb.org/t/p/w92/second.png',
            displayPriority: 2,
          },
        ],
        rent: [],
        buy: [],
        free: [],
        ads: [],
      },
      attribution: {
        provider: 'JustWatch',
      },
    });
  });

  it('rejects unsupported watch provider regions', async () => {
    const user = await createMediaUser('invalid-region-user');

    await expect(mediaService.getWatchProviders(user.id, 'movie', '886401', 'XX')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Choose a supported country',
      fieldErrors: {
        region: 'Choose a supported country',
      },
    });
    expect(tmdbClient.fetchWatchProviders).not.toHaveBeenCalled();
  });

  it('combines movie and TV genre maps', async () => {
    tmdbClient.fetchMovieGenres.mockResolvedValue({
      genres: [
        { id: 18, name: 'Drama' },
        { id: 28, name: 'Action' },
      ],
    });
    tmdbClient.fetchTvGenres.mockResolvedValue({
      genres: [
        { id: 10759, name: 'Action & Adventure' },
        { id: 35, name: 'Comedy' },
      ],
    });

    const genres = await mediaService.getGenres();

    expect(genres).toEqual({
      18: 'Drama',
      28: 'Action',
      35: 'Comedy',
      10759: 'Action & Adventure',
    });
  });

  it('searches movies and enriches result metadata', async () => {
    const user = await createMediaUser('media-search-user');

    await createInteraction(user, 886501, { watchlist: true });
    tmdbClient.searchMediaByType.mockResolvedValue({
      page: 2,
      total_pages: 3,
      total_results: 41,
      results: [createMovie(886501)],
    });

    const result = await mediaService.searchMedia(user.id, 'movie', 'Movie', 2);

    expect(tmdbClient.searchMediaByType).toHaveBeenCalledWith('movie', 'Movie', 2);
    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 20,
      total: 41,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(result.data[0]).toMatchObject({
      media_id: 886501,
      media_type: 'movie',
      watchlist: true,
    });
  });

  it('supports TV list normalization', async () => {
    const user = await createMediaUser('tv-list-user');

    tmdbClient.fetchPopularTvs.mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [createTv(886601)],
    });

    const tvs = await mediaService.getPopularTvs(user.id);

    expect(tvs).toEqual([
      expect.objectContaining({
        media_id: 886601,
        media_type: 'tv',
        name: 'TV 886601',
        liked: false,
        watched: false,
        watchlist: false,
      }),
    ]);
  });
});
