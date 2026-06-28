import { prisma } from '@/lib/prisma';
import { createPaginationMeta } from '@/lib/pagination';

import {
  MediaType,
  NormalizedTMDBMedia,
  NormalizedTMDBMovie,
  NormalizedTMDBTv,
  TMDBMovie,
  TMDBMovieDetailsWithMeta,
  TMDBMovieWithMeta,
  TMDBTv,
  TMDBTvDetailsWithMeta,
  TMDBTvWithMeta,
} from './media.types';
import {
  fetchMediaDetails,
  fetchMovieGenres,
  fetchPopularMovies,
  fetchPopularTvs,
  fetchTopRatedMovies,
  fetchTopRatedTvs,
  fetchTrendingMovies,
  fetchTrendingTvs,
  fetchTvGenres,
  searchMediaByType,
} from './tmdb.client';

const isMediaType = (value: string): value is MediaType => value === 'movie' || value === 'tv';

const parseMediaId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw {
      status: 400,
      message: 'Media ID must be a positive integer',
    };
  }

  return id;
};

const assertMediaType = (value: string): MediaType => {
  if (!isMediaType(value)) {
    throw {
      status: 400,
      message: 'Media type must be either movie or tv',
    };
  }

  return value;
};

const normalizeMovie = (media: TMDBMovie): NormalizedTMDBMovie => ({
  ...media,
  media_type: 'movie',
});

const normalizeTv = (media: TMDBTv): NormalizedTMDBTv => ({
  ...media,
  media_type: 'tv',
});

const interactionKey = (mediaType: MediaType, mediaId: number) => `${mediaType}:${mediaId}`;

const enrichMediaWithUserInteractions = async (
  media: NormalizedTMDBMedia[],
  userId: string,
): Promise<TMDBMovieWithMeta[] | TMDBTvWithMeta[]> => {
  const mediaIds = media.map((m) => m.id);
  const mediaTypes = [...new Set(media.map((m) => m.media_type))];

  const interactions = await prisma.userMedia.findMany({
    where: {
      userId,
      media_id: { in: mediaIds },
      media_type: { in: mediaTypes },
    },
  });

  const map = new Map<string, (typeof interactions)[number]>();

  interactions.forEach((i) => {
    map.set(interactionKey(i.media_type, i.media_id), i);
  });

  const enriched = media.map((m) => {
    const { id, ...rest } = m;
    const interaction = map.get(interactionKey(m.media_type, id));

    return {
      ...rest,
      media_id: id,
      liked: interaction?.liked ?? false,
      watched: interaction?.watched ?? false,
      watchlist: interaction?.watchlist ?? false,
    };
  });

  return enriched as TMDBMovieWithMeta[] | TMDBTvWithMeta[];
};

export async function getTrendingMovies(userId: string) {
  const response = await fetchTrendingMovies();
  return enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getTrendingTvs(userId: string) {
  const response = await fetchTrendingTvs();
  return enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getPopularMovies(userId: string) {
  const response = await fetchPopularMovies();
  return enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getPopularTvs(userId: string) {
  const response = await fetchPopularTvs();
  return enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getTopRatedMovies(userId: string) {
  const response = await fetchTopRatedMovies();
  return enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getTopRatedTvs(userId: string) {
  const response = await fetchTopRatedTvs();
  return enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getMediaDetails(userId: string, mediaType: string, id: string) {
  const validMediaType = assertMediaType(mediaType);
  const mediaId = parseMediaId(id);
  const response = await fetchMediaDetails(validMediaType, mediaId);

  const interactions = await prisma.userMedia.findFirst({
    where: {
      userId,
      media_id: mediaId,
      media_type: validMediaType,
    },
  });

  const { id: responseMediaId, ...rest } = response;

  return {
    ...rest,
    media_id: responseMediaId,
    media_type: validMediaType,
    liked: interactions?.liked ?? false,
    watched: interactions?.watched ?? false,
    watchlist: interactions?.watchlist ?? false,
  } as TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta;
}

export async function getGenres() {
  const movieGenre = await fetchMovieGenres();
  const tvGenre = await fetchTvGenres();

  const combinedGenreHashMap: Record<number, string> = {};

  movieGenre.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  tvGenre.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  return combinedGenreHashMap;
}

export async function searchMedia(userId: string, mediaType: string, query: string, page: number) {
  const validMediaType = assertMediaType(mediaType);
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      data: [],
      pagination: createPaginationMeta(1, 20, 0),
    };
  }

  if (validMediaType === 'movie') {
    const response = await searchMediaByType('movie', normalizedQuery, page);
    const data = (await enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId)) as
      | TMDBMovieWithMeta[]
      | TMDBTvWithMeta[];

    return {
      data,
      pagination: createPaginationMeta(page, 20, response.total_results),
    };
  }

  const response = await searchMediaByType('tv', normalizedQuery, page);
  const data = (await enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId)) as
    | TMDBMovieWithMeta[]
    | TMDBTvWithMeta[];

  return {
    data,
    pagination: createPaginationMeta(page, 20, response.total_results),
  };
}
