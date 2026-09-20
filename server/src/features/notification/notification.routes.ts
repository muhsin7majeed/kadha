import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import {
  getNotifications,
  getPushConfig,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  registerPushSubscription,
  unregisterPushSubscription,
} from './notification.controller';

const router = Router();

router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/push/config', authMiddleware, getPushConfig);
router.put('/push/subscription', authMiddleware, registerPushSubscription);
router.delete('/push/subscription', authMiddleware, unregisterPushSubscription);
router.get('/', authMiddleware, getNotifications);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;
