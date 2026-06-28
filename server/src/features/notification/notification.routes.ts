import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from './notification.controller';

const router = Router();

router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/', authMiddleware, getNotifications);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;
