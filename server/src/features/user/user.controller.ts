import { Request, Response } from 'express';

import { badRequest, notFound, sendResponse } from '@/lib/http';
import { DataPrivacy } from '@/types/common';
import { getPaginationParams } from '@/lib/pagination';
import { requireAuthUser } from '@/middlewares/auth';
import {
  getCurrentUser,
  getCurrentUserMediaByFlag,
  getUserCollectionsByUsername,
  getUserMediaByUsername,
  getUserProfileByUsername,
  lockedResource,
  searchUsersByUsername,
  updateCurrentUser,
} from './user.service';
import { UpdateMePayload } from './user.schema';

export const getMe = async (req: Request, res: Response) => {
  const { id } = requireAuthUser(req);
  const user = await getCurrentUser(id);

  sendResponse(res, user);
};

export const updateMe = async (req: Request, res: Response) => {
  const { id } = requireAuthUser(req);
  const { username, profilePrivacy, watchedPrivacy, likedPrivacy, watchlistPrivacy } = req.body as UpdateMePayload;
  const result = await updateCurrentUser(
    id,
    username,
    profilePrivacy as DataPrivacy,
    (watchedPrivacy || DataPrivacy.Friends) as DataPrivacy,
    (likedPrivacy || DataPrivacy.Friends) as DataPrivacy,
    (watchlistPrivacy || DataPrivacy.OnlyMe) as DataPrivacy,
  );

  if ('fieldErrors' in result) {
    throw badRequest('Validation failed', result.fieldErrors);
  }

  sendResponse(res, result);
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;
  const { id: currentUserId } = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  const data = await searchUsersByUsername(currentUserId, typeof query === 'string' ? query : '', page, limit);

  sendResponse(res, data);
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  const { id } = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  const data = await getCurrentUserMediaByFlag(id, 'watchlist', page, limit);

  sendResponse(res, data);
};

export const getUserLiked = async (req: Request, res: Response) => {
  const { id } = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  const data = await getCurrentUserMediaByFlag(id, 'liked', page, limit);

  sendResponse(res, data);
};

export const getUserProfile = async (req: Request, res: Response) => {
  const result = await getUserProfileByUsername(requireAuthUser(req).id, req.params.username);

  if (!result) {
    throw notFound('User not found');
  }

  if ('blocked' in result) {
    throw notFound('User not found');
  }

  sendResponse(res, result);
};

export const getUserWatchedByUsername = async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await getUserMediaByUsername(requireAuthUser(req).id, req.params.username, 'watched', page, limit);

  if (!result) {
    throw notFound('User not found');
  }

  if ('blocked' in result) {
    return sendResponse(res, lockedResource('PRIVATE'), 403);
  }

  sendResponse(res, result);
};

export const getUserLikedByUsername = async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await getUserMediaByUsername(requireAuthUser(req).id, req.params.username, 'liked', page, limit);

  if (!result) {
    throw notFound('User not found');
  }

  if ('blocked' in result) {
    return sendResponse(res, lockedResource('PRIVATE'), 403);
  }

  sendResponse(res, result);
};

export const getUserWatchlistByUsername = async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await getUserMediaByUsername(requireAuthUser(req).id, req.params.username, 'watchlist', page, limit);

  if (!result) {
    throw notFound('User not found');
  }

  if ('blocked' in result) {
    return sendResponse(res, lockedResource('PRIVATE'), 403);
  }

  sendResponse(res, result);
};

export const getUserCollectionsByUsernameController = async (req: Request, res: Response) => {
  const result = await getUserCollectionsByUsername(requireAuthUser(req).id, req.params.username);

  if (!result) {
    throw notFound('User not found');
  }

  if ('blocked' in result) {
    return sendResponse(res, lockedResource('PRIVATE'), 403);
  }

  sendResponse(res, result);
};

export const getUserWatched = async (req: Request, res: Response) => {
  const { id } = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  const data = await getCurrentUserMediaByFlag(id, 'watched', page, limit);

  sendResponse(res, data);
};
