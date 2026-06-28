import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  getMe,
  getUserCollectionsByUsernameController,
  getUserLiked,
  getUserLikedByUsername,
  getUserProfile,
  getUserWatched,
  getUserWatchedByUsername,
  getUserWatchlist,
  getUserWatchlistByUsername,
  searchUsers,
  updateMe,
} from './user.controller';
import { updateMeSchema } from './user.schema';

const router = Router();

router.get('/me', getMe);
router.put('/me', validate(updateMeSchema), updateMe);

router.get('/watchlist', getUserWatchlist);
router.get('/liked', getUserLiked);
router.get('/watched', getUserWatched);

router.get('/search', searchUsers);

router.get('/:username/profile', getUserProfile);
router.get('/:username/watchlist', getUserWatchlistByUsername);
router.get('/:username/liked', getUserLikedByUsername);
router.get('/:username/watched', getUserWatchedByUsername);
router.get('/:username/collections', getUserCollectionsByUsernameController);

export default router;
