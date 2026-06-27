import { Request, Response } from 'express';

import { DataPrivacy } from '@/types/common';
import { getCurrentUser, getUserMediaByFlag, searchUsersByUsername, updateCurrentUser } from './user.service';

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await getCurrentUser(id);

  res.json(user);
};

export const updateMe = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { username, profilePrivacy } = req.body;
  const result = await updateCurrentUser(id, username, profilePrivacy as DataPrivacy);

  if ('fieldErrors' in result) {
    return res.status(400).json({ fieldErrors: result.fieldErrors });
  }

  res.json(result);
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;
  const { id: currentUserId } = req.user;
  const data = await searchUsersByUsername(currentUserId, query as string);

  res.json({ data });
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  console.log(req.params);
  const { id } = req.user;
  const data = await getUserMediaByFlag(id, 'watchlist');

  res.json({ data });
};

export const getUserLiked = async (req: Request, res: Response) => {
  const { id } = req.user;
  const data = await getUserMediaByFlag(id, 'liked');

  res.json({ data });
};

export const getUserWatched = async (req: Request, res: Response) => {
  const { id } = req.user;
  const data = await getUserMediaByFlag(id, 'watched');

  res.json({ data });
};
