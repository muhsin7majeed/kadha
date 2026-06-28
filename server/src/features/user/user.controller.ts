import { Request, Response } from 'express';

import { DataPrivacy } from '@/types/common';
import { getPaginationParams } from '@/lib/pagination';
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
  const { id } = req.user;
  const user = await getCurrentUser(id);

  res.json(user);
};

export const updateMe = async (req: Request, res: Response) => {
  const { id } = req.user;
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
    return res.status(400).json({ fieldErrors: result.fieldErrors });
  }

  res.json(result);
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;
  const { id: currentUserId } = req.user;
  const { page, limit } = getPaginationParams(req.query);
  const data = await searchUsersByUsername(currentUserId, typeof query === 'string' ? query : '', page, limit);

  res.json(data);
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { page, limit } = getPaginationParams(req.query);
  const data = await getCurrentUserMediaByFlag(id, 'watchlist', page, limit);

  res.json(data);
};

export const getUserLiked = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { page, limit } = getPaginationParams(req.query);
  const data = await getCurrentUserMediaByFlag(id, 'liked', page, limit);

  res.json(data);
};

export const getUserProfile = async (req: Request, res: Response) => {
  const result = await getUserProfileByUsername(req.user.id, req.params.username);

  if (!result) {
    return res.status(404).json({ message: 'User not found' });
  }

  if ('blocked' in result) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(result);
};

export const getUserWatchedByUsername = async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await getUserMediaByUsername(req.user.id, req.params.username, 'watched', page, limit);

  if (!result) {
    return res.status(404).json({ message: 'User not found' });
  }

  if ('blocked' in result) {
    return res.status(403).json(lockedResource('PRIVATE'));
  }

  res.json(result);
};

export const getUserLikedByUsername = async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await getUserMediaByUsername(req.user.id, req.params.username, 'liked', page, limit);

  if (!result) {
    return res.status(404).json({ message: 'User not found' });
  }

  if ('blocked' in result) {
    return res.status(403).json(lockedResource('PRIVATE'));
  }

  res.json(result);
};

export const getUserWatchlistByUsername = async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await getUserMediaByUsername(req.user.id, req.params.username, 'watchlist', page, limit);

  if (!result) {
    return res.status(404).json({ message: 'User not found' });
  }

  if ('blocked' in result) {
    return res.status(403).json(lockedResource('PRIVATE'));
  }

  res.json(result);
};

export const getUserCollectionsByUsernameController = async (req: Request, res: Response) => {
  const result = await getUserCollectionsByUsername(req.user.id, req.params.username);

  if (!result) {
    return res.status(404).json({ message: 'User not found' });
  }

  if ('blocked' in result) {
    return res.status(403).json(lockedResource('PRIVATE'));
  }

  res.json(result);
};

export const getUserWatched = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { page, limit } = getPaginationParams(req.query);
  const data = await getCurrentUserMediaByFlag(id, 'watched', page, limit);

  res.json(data);
};
