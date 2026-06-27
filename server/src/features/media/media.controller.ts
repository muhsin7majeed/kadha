import { Request, Response } from 'express';

import { BaseResponse } from '@/types/common';
import {
  TMDBMovieDetailsWithMeta,
  TMDBMovieWithMeta,
  TMDBTvDetailsWithMeta,
  TMDBTvWithMeta,
} from './media.types';
import * as mediaService from './media.service';

export const getTrendingMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const data = await mediaService.getTrendingMovies(req.user.id);

  res.json({ data });
};

export const getTrendingTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const data = await mediaService.getTrendingTvs(req.user.id);

  res.json({ data });
};

export const getPopularMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const data = await mediaService.getPopularMovies(req.user.id);

  res.json({ data });
};

export const getPopularTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const data = await mediaService.getPopularTvs(req.user.id);

  res.json({ data });
};

export const getTopRatedMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const data = await mediaService.getTopRatedMovies(req.user.id);

  res.json({ data });
};

export const getTopRatedTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const data = await mediaService.getTopRatedTvs(req.user.id);

  res.json({ data });
};

export const getMediaDetails = async (
  req: Request,
  res: Response<BaseResponse<TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta>>,
) => {
  const { mediaType, id } = req.params;
  const data = await mediaService.getMediaDetails(req.user.id, mediaType, id);

  res.json({ data });
};

export const getGenre = async (req: Request, res: Response<BaseResponse<Record<number, string>>>) => {
  const data = await mediaService.getGenres();

  res.json({ data });
};

export const searchMedia = async (
  req: Request,
  res: Response<BaseResponse<TMDBMovieWithMeta[] | TMDBTvWithMeta[]>>,
) => {
  const { query } = req.params;
  const data = await mediaService.searchMedia(req.user.id, query);

  res.json({ data });
};
