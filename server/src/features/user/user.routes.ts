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
import { exportQuerySchema } from './user-export.schema';
import { deleteMeSchema, updateMeSchema } from './user.schema';
import { sensitiveActionRateLimit } from '@/features/auth/auth-rate-limit';
import { requireJsonAuthRequest, validateAuthRequestOrigin } from '@/features/auth/auth-request-security';

const router = Router();

router.get('/me', getMe);
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

router.get('/watchlist', getUserWatchlist);
router.get('/liked', getUserLiked);
router.get('/watched', getUserWatched);
router.get('/in-progress', getUserInProgressTv);

router.get('/search', searchUsers);

router.get('/:username/profile', getUserProfile);
router.get('/:username/watchlist', getUserWatchlistByUsername);
router.get('/:username/liked', getUserLikedByUsername);
router.get('/:username/watched', getUserWatchedByUsername);
router.get('/:username/collections', getUserCollectionsByUsernameController);

export default router;
