import { prisma } from '@/lib/prisma';

import {
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
  searchMediaByQuery,
} from './tmdb.client';

type TMDBMedia = TMDBMovie | TMDBTv;

const enrichMediaWithUserInteractions = async (
  media: TMDBMedia[],
  userId: string,
): Promise<TMDBMovieWithMeta[] | TMDBTvWithMeta[]> => {
  const mediaIds = media.map((m) => m.id);

  const interactions = await prisma.userMedia.findMany({
    where: {
      userId,
      media_id: { in: mediaIds },
    },
  });

  const map = new Map();

  interactions.forEach((i) => {
    map.set(i.media_id, i);
  });

  const enriched = media.map((m) => {
    const { id, ...rest } = m;
    return {
      ...rest,
      media_id: id,
      liked: map.get(id)?.liked ?? false,
      watched: map.get(id)?.watched ?? false,
      watchlist: map.get(id)?.watchlist ?? false,
    };
  });

  return enriched as TMDBMovieWithMeta[] | TMDBTvWithMeta[];
};

export async function getTrendingMovies(userId: string) {
  const response = await fetchTrendingMovies();
  return enrichMediaWithUserInteractions(response.data.results, userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getTrendingTvs(userId: string) {
  const response = await fetchTrendingTvs();
  return enrichMediaWithUserInteractions(response.data.results, userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getPopularMovies(userId: string) {
  const response = await fetchPopularMovies();
  return enrichMediaWithUserInteractions(response.data.results, userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getPopularTvs(userId: string) {
  const response = await fetchPopularTvs();
  return enrichMediaWithUserInteractions(response.data.results, userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getTopRatedMovies(userId: string) {
  const response = await fetchTopRatedMovies();
  return enrichMediaWithUserInteractions(response.data.results, userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getTopRatedTvs(userId: string) {
  const response = await fetchTopRatedTvs();
  return enrichMediaWithUserInteractions(response.data.results, userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getMediaDetails(userId: string, mediaType: string, id: string) {
  const response = await fetchMediaDetails(mediaType, id);

  const interactions = await prisma.userMedia.findFirst({
    where: {
      userId,
      media_id: parseInt(id),
      media_type: mediaType as 'movie' | 'tv',
    },
  });

  const { id: mediaId, ...rest } = response.data;

  return {
    ...rest,
    media_id: mediaId,
    liked: interactions?.liked ?? false,
    watched: interactions?.watched ?? false,
    watchlist: interactions?.watchlist ?? false,
  } as TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta;
}

export async function getGenres() {
  const movieGenre = await fetchMovieGenres();
  const tvGenre = await fetchTvGenres();

  const combinedGenreHashMap: Record<number, string> = {};

  movieGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  tvGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  return combinedGenreHashMap;
}

export async function searchMedia(userId: string, query: string) {
  const response = await searchMediaByQuery(query);

  const justMoviesAndTvs = response.data.results.filter(
    (result) => result.media_type === 'movie' || result.media_type === 'tv',
  );

  return enrichMediaWithUserInteractions(justMoviesAndTvs as TMDBMedia[], userId) as Promise<
    TMDBMovieWithMeta[] | TMDBTvWithMeta[]
  >;
}
