import api from '@/lib/axiosInstance';

import {
  MovieDBGenreResponse,
  MovieDBMovieResponse,
  MovieDBTvResponse,
  TMDBMovieDetails,
  TMDBTvDetails,
} from './media.types';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

const CACHE_TTL = {
  lists: 10 * ONE_MINUTE,
  details: 6 * ONE_HOUR,
  genres: 24 * ONE_HOUR,
  search: ONE_MINUTE,
};

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const getCached = async <T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const inFlight = inFlightRequests.get(key);

  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const request = fetcher()
    .then((data) => {
      responseCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });

      return data;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);

  return request;
};

export async function fetchTrendingMovies() {
  return getCached('trending:movie:day', CACHE_TTL.lists, async () => {
    const response = await api.get<MovieDBMovieResponse>('/trending/movie/day');
    return response.data;
  });
}

export async function fetchTrendingTvs() {
  return getCached('trending:tv:day', CACHE_TTL.lists, async () => {
    const response = await api.get<MovieDBTvResponse>('/trending/tv/day');
    return response.data;
  });
}

export async function fetchPopularMovies() {
  return getCached('popular:movie', CACHE_TTL.lists, async () => {
    const response = await api.get<MovieDBMovieResponse>('/movie/popular');
    return response.data;
  });
}

export async function fetchPopularTvs() {
  return getCached('popular:tv', CACHE_TTL.lists, async () => {
    const response = await api.get<MovieDBTvResponse>('/tv/popular');
    return response.data;
  });
}

export async function fetchTopRatedMovies() {
  return getCached('top-rated:movie', CACHE_TTL.lists, async () => {
    const response = await api.get<MovieDBMovieResponse>('/movie/top_rated');
    return response.data;
  });
}

export async function fetchTopRatedTvs() {
  return getCached('top-rated:tv', CACHE_TTL.lists, async () => {
    const response = await api.get<MovieDBTvResponse>('/tv/top_rated');
    return response.data;
  });
}

export async function fetchMediaDetails(mediaType: 'movie' | 'tv', id: number) {
  return getCached(`details:${mediaType}:${id}`, CACHE_TTL.details, async () => {
    const response = await api.get<TMDBMovieDetails | TMDBTvDetails>(`/${mediaType}/${id}`);
    return response.data;
  });
}

export async function fetchMovieGenres() {
  return getCached('genres:movie', CACHE_TTL.genres, async () => {
    const response = await api.get<MovieDBGenreResponse>('/genre/movie/list');
    return response.data;
  });
}

export async function fetchTvGenres() {
  return getCached('genres:tv', CACHE_TTL.genres, async () => {
    const response = await api.get<MovieDBGenreResponse>('/genre/tv/list');
    return response.data;
  });
}

export async function searchMoviesByQuery(query: string, page: number) {
  const normalizedQuery = query.trim();

  return getCached(`search:movie:${normalizedQuery.toLowerCase()}:${page}`, CACHE_TTL.search, async () => {
    const response = await api.get<MovieDBMovieResponse>('/search/movie', {
      params: {
        query: normalizedQuery,
        page,
        include_adult: true,
      },
    });

    return response.data;
  });
}

export async function searchTvsByQuery(query: string, page: number) {
  const normalizedQuery = query.trim();

  return getCached(`search:tv:${normalizedQuery.toLowerCase()}:${page}`, CACHE_TTL.search, async () => {
    const response = await api.get<MovieDBTvResponse>('/search/tv', {
      params: {
        query: normalizedQuery,
        page,
        include_adult: true,
      },
    });

    return response.data;
  });
}
