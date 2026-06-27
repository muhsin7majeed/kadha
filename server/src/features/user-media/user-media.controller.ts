import { Request, Response } from 'express';

import { UserMediaPayload } from './user-media.schema';
import { upsertUserMedia } from './user-media.service';

export const addToLiked = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;

  await upsertUserMedia(req.user.id, payload, {
    liked: payload.liked,
  });

  return res.json({ message: `${payload.media_type} ${payload.liked ? 'liked' : 'unliked'}` });
};

export const addToWatched = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;

  await upsertUserMedia(req.user.id, payload, {
    watched: payload.watched,
    watchlist: false,
  });

  return res.json({
    message: `${payload.media_type} ${payload.watched ? 'watched' : 'unwatched'}`,
  });
};

export const addToWatchlist = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;

  await upsertUserMedia(req.user.id, payload, {
    watchlist: payload.watchlist,
  });

  return res.json({
    message: `${payload.media_type} ${payload.watchlist ? 'added to watchlist' : 'removed from watchlist'}`,
  });
};
