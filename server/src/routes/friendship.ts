import {
  acceptFriendRequest,
  blockUser,
  rejectFriendRequest,
  sendFriendRequest,
  unblockUser,
} from '@/controllers/friendship';
import { authMiddleware } from '@/middlewares/auth';
import { Router } from 'express';

const router = Router();

router.post('/send-friend-request', authMiddleware, sendFriendRequest);
router.post('/accept-friend-request', authMiddleware, acceptFriendRequest);
router.post('/reject-friend-request', authMiddleware, rejectFriendRequest);
router.post('/block-user', authMiddleware, blockUser);
router.post('/unblock-user', authMiddleware, unblockUser);

export default router;
