import { Request, Response } from 'express';

import { badRequest, sendResponse } from '@/lib/http';
import { getPaginationParams } from '@/lib/pagination';
import { requireAuthUser } from '@/middlewares/auth';
import {
  acceptRequest,
  blockFriend,
  FriendshipType,
  getFriendshipUsers,
  rejectRequest,
  removeFriend,
  sendRequest,
  unblockFriend,
} from './friendship.service';

export const sendFriendRequest = async (req: Request, res: Response) => {
  const { id: senderId } = requireAuthUser(req);
  const { receiverId } = req.body;
  const result = await sendRequest(senderId, receiverId);

  return sendResponse(res, result.body, result.status);
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { senderId } = req.body;
  const result = await acceptRequest(currentUserId, senderId);

  return sendResponse(res, result.body, result.status);
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { senderId } = req.body;
  const result = await rejectRequest(currentUserId, senderId);

  return sendResponse(res, result.body, result.status);
};

export const unfriend = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { userId } = req.body;
  const result = await removeFriend(currentUserId, userId);

  return sendResponse(res, result.body, result.status);
};

export const blockUser = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { userId } = req.body;
  const result = await blockFriend(currentUserId, userId);

  return sendResponse(res, result.body, result.status);
};

export const unblockUser = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { userId } = req.body;
  const result = await unblockFriend(currentUserId, userId);

  return sendResponse(res, result.body, result.status);
};

export const getFriendships = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const type = (req.query.type as FriendshipType) || 'friends';
  const { page, limit } = getPaginationParams(req.query);
  const data = await getFriendshipUsers(currentUserId, type, page, limit);

  if (!data) {
    throw badRequest('Invalid friendship type');
  }

  sendResponse(res, data);
};
