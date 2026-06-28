import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  acceptFriendRequest,
  blockUser,
  getFriendships,
  rejectFriendRequest,
  sendFriendRequest,
  unblockUser,
  unfriend,
} from './friendship.controller';
import { sendFriendRequestSchema, senderIdSchema, userIdBodySchema } from './friendship.schema';

const router = Router();

router.post('/send-friend-request', authMiddleware, validate(sendFriendRequestSchema), sendFriendRequest);
router.post('/accept-friend-request', authMiddleware, validate(senderIdSchema), acceptFriendRequest);
router.post('/reject-friend-request', authMiddleware, validate(senderIdSchema), rejectFriendRequest);
router.post('/block-user', authMiddleware, validate(userIdBodySchema), blockUser);
router.post('/unblock-user', authMiddleware, validate(userIdBodySchema), unblockUser);
router.post('/unfriend', authMiddleware, validate(userIdBodySchema), unfriend);

router.get('/friendships', authMiddleware, getFriendships);

export default router;
