import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  deleteMe,
  exportMe,
  getMyDeletionImpact,
  getUserInProgressTv,
  getMe,
  getUserCollectionsByUsernameController,
  getUserLiked,
  getUserLikedByUsername,
  getUserProfile,
  getUserWatched,
  getUserWatchedByUsername,
  getUserWatchlist,
  getUserWatchlistByUsername,
  previewImport,
  applyImport,
  searchUsers,
  updateMe,
} from './user.controller';
import { importPayloadSchema } from './user-import.schema';
import { letterboxdImportSchema, letterboxdPreviewSchema } from './letterboxd-import.schema';
import { importLetterboxd, previewLetterboxd } from './letterboxd-import.controller';
import { exportQuerySchema } from './user-export.schema';
import { deleteMeSchema, updateMeSchema } from './user.schema';
import { sensitiveActionRateLimit } from '@/features/auth/auth-rate-limit';
import { requireJsonAuthRequest, validateAuthRequestOrigin } from '@/features/auth/auth-request-security';
import { userMediaQuerySchema } from './user-media-query.schema';

const router = Router();

router.get('/me', getMe);
router.post('/letterboxd/preview', validateAuthRequestOrigin, requireJsonAuthRequest, validate(letterboxdPreviewSchema), previewLetterboxd);
router.post('/letterboxd/import', validateAuthRequestOrigin, requireJsonAuthRequest, validate(letterboxdImportSchema), importLetterboxd);
router.get('/deletion-impact', getMyDeletionImpact);
router.post(
  '/import/preview',
  validateAuthRequestOrigin,
  requireJsonAuthRequest,
  validate(importPayloadSchema),
  previewImport,
);
router.post(
  '/import',
  validateAuthRequestOrigin,
  requireJsonAuthRequest,
  sensitiveActionRateLimit,
  validate(importPayloadSchema),
  applyImport,
);
router.put('/me', validate(updateMeSchema), updateMe);
router.delete(
  '/me',
  validateAuthRequestOrigin,
  requireJsonAuthRequest,
  sensitiveActionRateLimit,
  validate(deleteMeSchema),
  deleteMe,
);
router.get('/export', validate(exportQuerySchema, 'query'), exportMe);

router.get('/watchlist', validate(userMediaQuerySchema, 'query'), getUserWatchlist);
router.get('/liked', validate(userMediaQuerySchema, 'query'), getUserLiked);
router.get('/watched', validate(userMediaQuerySchema, 'query'), getUserWatched);
router.get('/in-progress', getUserInProgressTv);

router.get('/search', searchUsers);

router.get('/:username/profile', getUserProfile);
router.get('/:username/watchlist', getUserWatchlistByUsername);
router.get('/:username/liked', getUserLikedByUsername);
router.get('/:username/watched', getUserWatchedByUsername);
router.get('/:username/collections', getUserCollectionsByUsernameController);

export default router;
