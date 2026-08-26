import { Router } from 'express';

import { getPublicCollectionById } from '@/features/collection/collection.controller';
import { getPublicMediaDetails, getPublicWatchProviders } from '@/features/media/media.controller';
import {
  getUserCollectionsByUsernameController,
  getUserLikedByUsername,
  getUserProfile,
  getUserWatchedByUsername,
  getUserWatchlistByUsername,
} from '@/features/user/user.controller';

const router = Router();

router.get('/users/:username/profile', getUserProfile);
router.get('/users/:username/watchlist', getUserWatchlistByUsername);
router.get('/users/:username/liked', getUserLikedByUsername);
router.get('/users/:username/watched', getUserWatchedByUsername);
router.get('/users/:username/collections', getUserCollectionsByUsernameController);
router.get('/collections/:id', getPublicCollectionById);
router.get('/media/:mediaType/:id/watch-providers', getPublicWatchProviders);
router.get('/media/:mediaType/:id', getPublicMediaDetails);

export default router;
