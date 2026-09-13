import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  addToLiked,
  addToWatched,
  addToWatchlist,
  clearEpisodeWatchedController,
  clearSeasonWatchedController,
  createWatchEventController,
  deleteWatchEventController,
  getDiaryInsightsController,
  getDiaryTimelineController,
  getTvProgressController,
  markAllAiredWatchedController,
  markEpisodeWatchedController,
  markNextEpisodeWatchedController,
  markSeasonWatchedController,
  listWatchEventsController,
  updateWatchEventController,
} from './user-media.controller';
import { diaryInsightsQuerySchema, diaryQuerySchema } from './diary.schema';
import {
  episodeWatchSchema,
  userMediaSchema,
  watchEventCreateSchema,
  watchEventUpdateSchema,
} from './user-media.schema';

const router = Router();

router.get('/diary/insights', validate(diaryInsightsQuerySchema, 'query'), getDiaryInsightsController);
router.get('/diary', validate(diaryQuerySchema, 'query'), getDiaryTimelineController);
router.get('/tv/:mediaId/progress', getTvProgressController);
router.post('/tv/:mediaId/episodes', validate(episodeWatchSchema), markEpisodeWatchedController);
router.delete('/tv/:mediaId/episodes/:seasonNumber/:episodeNumber', clearEpisodeWatchedController);
router.post('/tv/:mediaId/seasons/:seasonNumber/watched', markSeasonWatchedController);
router.delete('/tv/:mediaId/seasons/:seasonNumber/watched', clearSeasonWatchedController);
router.post('/tv/:mediaId/mark-all-aired-watched', markAllAiredWatchedController);
router.post('/tv/:mediaId/mark-next-episode-watched', markNextEpisodeWatchedController);
router.get('/:mediaType/:mediaId/watch-events', listWatchEventsController);
router.post('/watch-events', validate(watchEventCreateSchema), createWatchEventController);
router.patch('/watch-events/:eventId', validate(watchEventUpdateSchema), updateWatchEventController);
router.delete('/watch-events/:eventId', deleteWatchEventController);
router.post('/liked', validate(userMediaSchema), addToLiked);
router.post('/watchlist', validate(userMediaSchema), addToWatchlist);
router.post('/watched', validate(userMediaSchema), addToWatched);

export default router;
