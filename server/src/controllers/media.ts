import api from '@/lib/axiosInstance';
import { Request, Response } from 'express';
import { BaseResponse } from '@/types/common';
import { prisma } from '@/lib/prisma';
import {
  MovieDBMovieResponse,
  MovieDBTvResponse,
  TMDBMovie,
  TMDBTv,
  TMDBMovieDetails,
  TMDBTvDetails,
  MovieDBGenreResponse,
} from '@/types/themoviedb';
import { TMDBMovieWithMeta, TMDBTvWithMeta, TMDBMovieDetailsWithMeta, TMDBTvDetailsWithMeta } from '@/types/media';

// Helper to rename 'id' to 'media_id' for TMDB responses
const transformIdToMediaId = <T extends { id: number }>(item: T): Omit<T, 'id'> & { media_id: number } => {
  const { id, ...rest } = item;
  return { ...rest, media_id: id };
};

const enrichMediaWithUserInteractions = async (
  media: TMDBMovie[] | TMDBTv[],
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

  // Transform id to media_id and enrich with user interactions
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

export const getTrendingMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const response = await api.get<MovieDBMovieResponse>('/trending/movie/day');

  const enriched = await enrichMediaWithUserInteractions(response.data.results, req.user.id);

  res.json({ data: enriched as TMDBMovieWithMeta[] });
};

export const getTrendingTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const response = await api.get<MovieDBTvResponse>('/trending/tv/day');

  const enriched = await enrichMediaWithUserInteractions(response.data.results, req.user.id);

  res.json({ data: enriched as TMDBTvWithMeta[] });
};

export const getPopularMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const response = await api.get<MovieDBMovieResponse>('/movie/popular');

  const enriched = await enrichMediaWithUserInteractions(response.data.results, req.user.id);

  res.json({ data: enriched as TMDBMovieWithMeta[] });
};

export const getPopularTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const response = await api.get<MovieDBTvResponse>('/tv/popular');

  const enriched = await enrichMediaWithUserInteractions(response.data.results, req.user.id);

  res.json({ data: enriched as TMDBTvWithMeta[] });
};

export const getTopRatedMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const response = await api.get<MovieDBMovieResponse>('/movie/top_rated');

  const enriched = await enrichMediaWithUserInteractions(response.data.results, req.user.id);

  res.json({ data: enriched as TMDBMovieWithMeta[] });
};

export const getTopRatedTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const response = await api.get<MovieDBTvResponse>('/tv/top_rated');

  const enriched = await enrichMediaWithUserInteractions(response.data.results, req.user.id);

  res.json({ data: enriched as TMDBTvWithMeta[] });
};

export const getMediaDetails = async (
  req: Request,
  res: Response<BaseResponse<TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta>>,
) => {
  const { mediaType, id } = req.params;

  const response = await api.get<TMDBMovieDetails | TMDBTvDetails>(`/${mediaType}/${id}`);

  const interactions = await prisma.userMedia.findFirst({
    where: {
      userId: req.user.id,
      media_id: parseInt(id),
      media_type: mediaType as 'movie' | 'tv',
    },
  });

  // Transform id to media_id
  const { id: mediaId, ...rest } = response.data;
  const enriched = {
    ...rest,
    media_id: mediaId,
    liked: interactions?.liked ?? false,
    watched: interactions?.watched ?? false,
    watchlist: interactions?.watchlist ?? false,
  };

  res.json({ data: enriched as TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta });
};

export const getGenre = async (req: Request, res: Response<BaseResponse<Record<number, string>>>) => {
  const movieGenre = await api.get<MovieDBGenreResponse>('/genre/movie/list');
  const tvGenre = await api.get<MovieDBGenreResponse>('/genre/tv/list');

  let combinedGenreHashMap: Record<number, string> = {};

  movieGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  tvGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  res.json({ data: combinedGenreHashMap });
};

export const searchMedia = async (
  req: Request,
  res: Response<BaseResponse<TMDBMovieWithMeta[] | TMDBTvWithMeta[]>>,
) => {
  const { query } = req.params;

  const response = await api.get<MovieDBMovieResponse | MovieDBTvResponse>(
    `/search/multi?query=${query}&include_adult=true`,
  );

  const justMoviesAndTvs = response.data.results.filter(
    (result) => result.media_type === 'movie' || result.media_type === 'tv',
  );

  const enriched = await enrichMediaWithUserInteractions(justMoviesAndTvs as TMDBMovie[] | TMDBTv[], req.user.id);

  res.json({ data: enriched as TMDBMovieWithMeta[] | TMDBTvWithMeta[] });
};
