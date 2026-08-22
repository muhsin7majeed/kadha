import { Request, Response } from 'express';

import { sendData, sendMessage } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import {
  EpisodeWatchPayload,
  UserMediaPayload,
  WatchEventCreatePayload,
  WatchEventUpdatePayload,
} from './user-media.schema';
import {
  clearEpisodeWatched,
  clearSeasonWatched,
  getTvProgress,
  markAllAiredWatched,
  markEpisodeWatched,
  markNextEpisodeWatched,
  markSeasonWatched,
} from './tv-progress.service';
import { upsertUserMedia } from './user-media.service';
import { createWatchEvent, deleteWatchEvent, listWatchEvents, updateWatchEvent } from './watch-event.service';

export const addToLiked = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;
  const flagUpdate = {
    liked: payload.liked,
    ...(payload.watched === true ? { watched: true, watchlist: false } : {}),
  };

  await upsertUserMedia(requireAuthUser(req).id, payload, flagUpdate);

  return sendMessage(res, `${payload.media_type} ${payload.liked ? 'liked' : 'unliked'}`);
};

export const addToWatched = async (req: Request, res: Response) => {
  const payload = req.body as UserMediaPayload;
  const flagUpdate = {
    watched: payload.watched,
    watchlist: false,
    ...(typeof payload.liked === 'boolean' ? { liked: payload.liked } : {}),
  };

  await upsertUserMedia(requireAuthUser(req).id, payload, flagUpdate);

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

export const getTvProgressController = async (req: Request, res: Response) => {
  const selectedSeasonNumber = typeof req.query.seasonNumber === 'string' ? Number(req.query.seasonNumber) : undefined;
  const includeSpecials = req.query.includeSpecials === 'true';
  const data = await getTvProgress(requireAuthUser(req).id, req.params.mediaId, {
    selectedSeasonNumber,
    includeSpecials,
  });

  return sendData(res, data);
};

export const markEpisodeWatchedController = async (req: Request, res: Response) => {
  const data = await markEpisodeWatched(requireAuthUser(req).id, req.params.mediaId, req.body as EpisodeWatchPayload);

  return sendData(res, data);
};

export const clearEpisodeWatchedController = async (req: Request, res: Response) => {
  const data = await clearEpisodeWatched(
    requireAuthUser(req).id,
    req.params.mediaId,
    req.params.seasonNumber,
    req.params.episodeNumber,
  );

  return sendData(res, data);
};

export const markSeasonWatchedController = async (req: Request, res: Response) => {
  const data = await markSeasonWatched(requireAuthUser(req).id, req.params.mediaId, req.params.seasonNumber);

  return sendData(res, data);
};

export const clearSeasonWatchedController = async (req: Request, res: Response) => {
  const data = await clearSeasonWatched(requireAuthUser(req).id, req.params.mediaId, req.params.seasonNumber);

  return sendData(res, data);
};

export const markAllAiredWatchedController = async (req: Request, res: Response) => {
  const data = await markAllAiredWatched(requireAuthUser(req).id, req.params.mediaId);

  return sendData(res, data);
};

export const markNextEpisodeWatchedController = async (req: Request, res: Response) => {
  const data = await markNextEpisodeWatched(requireAuthUser(req).id, req.params.mediaId);

  return sendData(res, data);
};

export const listWatchEventsController = async (req: Request, res: Response) => {
  const data = await listWatchEvents(requireAuthUser(req).id, req.params.mediaId, req.params.mediaType);

  return sendData(res, data);
};

export const createWatchEventController = async (req: Request, res: Response) => {
  const data = await createWatchEvent(requireAuthUser(req).id, req.body as WatchEventCreatePayload);

  return sendData(res, data, 201);
};

export const updateWatchEventController = async (req: Request, res: Response) => {
  const data = await updateWatchEvent(requireAuthUser(req).id, req.params.eventId, req.body as WatchEventUpdatePayload);

  return sendData(res, data);
};

export const deleteWatchEventController = async (req: Request, res: Response) => {
  const data = await deleteWatchEvent(requireAuthUser(req).id, req.params.eventId);

  return sendData(res, data);
};
