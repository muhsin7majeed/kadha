import { Router } from 'express';
import { getMe, getUserWatchlist, getUserLiked, getUserWatched, updateMe } from '@/controllers/user';
import { authMiddleware } from '@/middlewares/auth';

const router = Router();

router.get('/me', authMiddleware, getMe);

router.put('/me', authMiddleware, updateMe);
router.get('/watchlist', authMiddleware, getUserWatchlist);
router.get('/liked', authMiddleware, getUserLiked);
router.get('/watched', authMiddleware, getUserWatched);

export default router;
