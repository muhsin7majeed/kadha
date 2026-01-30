import { Router } from 'express';
import { getMe, getUserWatchlist, getUserLiked, getUserWatched, updateMe, searchUsers } from '@/controllers/user';
import { authMiddleware } from '@/middlewares/auth';
import { getNotifications } from '@/controllers/notification';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

router.get('/watchlist', authMiddleware, getUserWatchlist);
router.get('/liked', authMiddleware, getUserLiked);
router.get('/watched', authMiddleware, getUserWatched);

router.get('/search', authMiddleware, searchUsers);
router.get('/notifications', authMiddleware, getNotifications);

export default router;
