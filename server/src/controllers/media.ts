import api from '@/lib/axiosInstance';
import { Media, MediaDetails } from '@/types/media';
import { MovieDBGenreResponse, TMDBMovieDetails, TMDBTvDetails } from '@/types/themoviedb';
import { MovieDBResponse } from '@/types/themoviedb';
import { Request, Response } from 'express';
import { getParsedMovieDBResponse, getParsedMovieDBDetailsResponse } from '@/utils/getParsedMovieDBResponse';
import { BaseResponse } from '@/types/common';
import userMedia from '@/models/user-media';

const enrichMediaWithUserInteractions = async (media: Media[], userId: string) => {
  const mediaIds = media.map((m) => m.mediaId);

  const interactions = await userMedia.find({
    userId,
    mediaId: { $in: mediaIds },
  });

  const map = new Map();

  interactions.forEach((i) => {
    map.set(i.mediaId, i);
  });

  const enriched = media.map((m) => ({
    ...m,
    liked: map.get(m.mediaId)?.liked ?? false,
    watched: map.get(m.mediaId)?.watched ?? false,
    watchlist: map.get(m.mediaId)?.watchlist ?? false,
  }));

  return enriched;
};

export const getTrendingMovies = async (req: Request, res: Response<BaseResponse<Media[]>>) => {
  const response = await api.get<MovieDBResponse>('/trending/movie/day');

  const parsedResponse = getParsedMovieDBResponse(response.data.results);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ data: enriched });
};

export const getTrendingTvs = async (req: Request, res: Response<BaseResponse<Media[]>>) => {
  const response = await api.get<MovieDBResponse>('/trending/tv/day');

  const parsedResponse = getParsedMovieDBResponse(response.data.results);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ data: enriched });
};

export const getPopularMovies = async (req: Request, res: Response<BaseResponse<Media[]>>) => {
  const response = await api.get<MovieDBResponse>('/movie/popular');

  const parsedResponse = getParsedMovieDBResponse(response.data.results);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ data: enriched });
};

export const getPopularTvs = async (req: Request, res: Response<BaseResponse<Media[]>>) => {
  const response = await api.get<MovieDBResponse>('/tv/popular');

  const parsedResponse = getParsedMovieDBResponse(response.data.results);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ data: enriched });
};

export const getTopRatedMovies = async (req: Request, res: Response<BaseResponse<Media[]>>) => {
  const response = await api.get<MovieDBResponse>('/movie/top_rated');

  const parsedResponse = getParsedMovieDBResponse(response.data.results);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ data: enriched });
};

export const getTopRatedTvs = async (req: Request, res: Response<BaseResponse<Media[]>>) => {
  const response = await api.get<MovieDBResponse>('/tv/top_rated');

  const parsedResponse = getParsedMovieDBResponse(response.data.results);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ data: enriched });
};

export const getMediaDetails = async (req: Request, res: Response<BaseResponse<MediaDetails>>) => {
  const { mediaType, id } = req.params;

  const response = await api.get<TMDBMovieDetails | TMDBTvDetails>(`/${mediaType}/${id}`);

  const parsedResponse = getParsedMovieDBDetailsResponse(response.data);

  const interactions = await userMedia.findOne({
    userId: req.user.id,
    mediaId: id,
    mediaType,
  });

  const enriched = {
    ...parsedResponse,
    liked: interactions?.liked ?? false,
    watched: interactions?.watched ?? false,
    watchlist: interactions?.watchlist ?? false,
  };

  res.json({ data: enriched });
};

export const getGenre = async (req: Request, res: Response) => {
  const movieGenre = await api.get<MovieDBGenreResponse>('/genre/movie/list');
  const tvGenre = await api.get<MovieDBGenreResponse>('/genre/tv/list');

  let genreHashMap: Record<number, string> = {};

  movieGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    genreHashMap[genre.id] = genre.name;
  });

  tvGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    genreHashMap[genre.id] = genre.name;
  });

  res.json({ genres: genreHashMap });
};

export const searchMedia = async (req: Request, res: Response) => {
  const { query } = req.params;

  const response = await api.get<MovieDBResponse>(`/search/multi?query=${query}&include_adult=true`);

  const justMoviesAndTvs = response.data.results.filter(
    (result) => result.media_type === 'movie' || result.media_type === 'tv',
  );

  const parsedResponse = getParsedMovieDBResponse(justMoviesAndTvs);

  const enriched = await enrichMediaWithUserInteractions(parsedResponse, req.user.id);

  res.json({ media: enriched });
};
