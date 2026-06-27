import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import { getMe, getUserLiked, getUserWatched, getUserWatchlist, searchUsers, updateMe } from './user.controller';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

router.get('/watchlist', authMiddleware, getUserWatchlist);
router.get('/liked', authMiddleware, getUserLiked);
router.get('/watched', authMiddleware, getUserWatched);

router.get('/search', authMiddleware, searchUsers);

router.get('/:username/watchlist', authMiddleware, getUserWatchlist);
router.get('/:username/liked', authMiddleware, getUserLiked);
router.get('/:username/watched', authMiddleware, getUserWatched);

export default router;
