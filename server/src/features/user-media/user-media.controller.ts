import { Request, Response } from 'express';

import { sendMessage } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { UserMediaPayload } from './user-media.schema';
import { upsertUserMedia } from './user-media.service';

export const addToLiked = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;

  await upsertUserMedia(requireAuthUser(req).id, payload, {
    liked: payload.liked,
  });

  return sendMessage(res, `${payload.media_type} ${payload.liked ? 'liked' : 'unliked'}`);
};

export const addToWatched = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;

  await upsertUserMedia(requireAuthUser(req).id, payload, {
    watched: payload.watched,
    watchlist: false,
  });

  return sendMessage(res, `${payload.media_type} ${payload.watched ? 'watched' : 'unwatched'}`);
};

export const addToWatchlist = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;

  await upsertUserMedia(requireAuthUser(req).id, payload, {
    watchlist: payload.watchlist,
  });

  return sendMessage(
    res,
    `${payload.media_type} ${payload.watchlist ? 'added to watchlist' : 'removed from watchlist'}`,
  );
};
