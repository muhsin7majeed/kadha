import { Request, Response } from 'express';

import { sendData, sendResponse } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { BaseResponse, PaginatedResponse } from '@/types/common';
import { getPaginationParams } from '@/lib/pagination';
import { TMDBMovieDetailsWithMeta, TMDBMovieWithMeta, TMDBTvDetailsWithMeta, TMDBTvWithMeta } from './media.types';
import * as mediaService from './media.service';

export const getTrendingMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const data = await mediaService.getTrendingMovies(requireAuthUser(req).id);

  sendData(res, data);
};

export const getTrendingTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const data = await mediaService.getTrendingTvs(requireAuthUser(req).id);

  sendData(res, data);
};

export const getPopularMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const data = await mediaService.getPopularMovies(requireAuthUser(req).id);

  sendData(res, data);
};

export const getPopularTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const data = await mediaService.getPopularTvs(requireAuthUser(req).id);

  sendData(res, data);
};

export const getTopRatedMovies = async (req: Request, res: Response<BaseResponse<TMDBMovieWithMeta[]>>) => {
  const data = await mediaService.getTopRatedMovies(requireAuthUser(req).id);

  sendData(res, data);
};

export const getTopRatedTvs = async (req: Request, res: Response<BaseResponse<TMDBTvWithMeta[]>>) => {
  const data = await mediaService.getTopRatedTvs(requireAuthUser(req).id);

  sendData(res, data);
};

export const getMediaDetails = async (
  req: Request,
  res: Response<BaseResponse<TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta>>,
) => {
  const { mediaType, id } = req.params;
  const data = await mediaService.getMediaDetails(requireAuthUser(req).id, mediaType, id);

  sendData(res, data);
};

export const getGenre = async (req: Request, res: Response<BaseResponse<Record<number, string>>>) => {
  const data = await mediaService.getGenres();

  sendData(res, data);
};

export const searchMedia = async (
  req: Request,
  res: Response<PaginatedResponse<TMDBMovieWithMeta[] | TMDBTvWithMeta[]>>,
) => {
  const { mediaType, query } = req.params;
  const { page } = getPaginationParams(req.query);
  const data = await mediaService.searchMedia(requireAuthUser(req).id, mediaType, query, page);

  sendResponse(res, data);
};
