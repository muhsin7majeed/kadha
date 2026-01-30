import {
  acceptFriendRequest,
  blockUser,
  getFriendships,
  rejectFriendRequest,
  sendFriendRequest,
  unblockUser,
  unfriend,
} from '@/controllers/friendship';
import { authMiddleware } from '@/middlewares/auth';
import { Router } from 'express';

const router = Router();

router.post('/send-friend-request', authMiddleware, sendFriendRequest);
router.post('/accept-friend-request', authMiddleware, acceptFriendRequest);
router.post('/reject-friend-request', authMiddleware, rejectFriendRequest);
router.post('/block-user', authMiddleware, blockUser);
router.post('/unblock-user', authMiddleware, unblockUser);
router.post('/unfriend', authMiddleware, unfriend);

router.get('/friendships', authMiddleware, getFriendships);

export default router;
