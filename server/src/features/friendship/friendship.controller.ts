import { Request, Response } from 'express';

import {
  acceptRequest,
  FriendshipType,
  getFriendshipUsers,
  rejectRequest,
  removeFriend,
  sendRequest,
  unblockFriend,
} from './friendship.service';

export const sendFriendRequest = async (req: Request, res: Response) => {
  const { id: senderId } = req.user;
  const { receiverId } = req.body;
  const result = await sendRequest(senderId, receiverId);

  return res.status(result.status).json(result.body);
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { senderId } = req.body;
  const result = await acceptRequest(currentUserId, senderId);

  return res.status(result.status).json(result.body);
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { senderId } = req.body;
  const result = await rejectRequest(currentUserId, senderId);

  return res.status(result.status).json(result.body);
};

export const unfriend = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { userId } = req.body;
  const result = await removeFriend(currentUserId, userId);

  return res.status(result.status).json(result.body);
};

export const blockUser = async (req: Request, res: Response) => {};

export const unblockUser = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { userId } = req.body;
  const result = await unblockFriend(currentUserId, userId);

  return res.status(result.status).json(result.body);
};

export const getFriendships = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const type = (req.query.type as FriendshipType) || 'friends';
  const data = await getFriendshipUsers(currentUserId, type);

  if (!data) {
    return res.status(400).json({ message: 'Invalid friendship type' });
  }

  res.json({ data });
};
