import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const sendFriendRequest = async (req: Request, res: Response) => {
  const { id: senderId } = req.user;
  const { receiverId } = req.body;

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Cannot send friend request to yourself' });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

  if (!receiver) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    return res.status(400).json({
      message: 'You are already friends or have already sent a friend request to this user',
      status: existing.status,
    });
  }

  const friendship = await prisma.friendship.create({
    data: { senderId, receiverId, status: 'PENDING' },
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'FRIEND_REQUEST_RECEIVED',
      actorId: senderId,
    },
  });

  return res.status(201).json(friendship);
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { senderId } = req.body;

  const friendship = await prisma.friendship.findFirst({
    where: {
      senderId,
      receiverId: currentUserId,
      status: 'PENDING',
    },
  });

  if (!friendship) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  const updatedFriendship = await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: 'ACCEPTED' },
  });

  await prisma.notification.create({
    data: {
      userId: senderId,
      type: 'FRIEND_REQUEST_ACCEPTED',
      actorId: currentUserId,
    },
  });

  return res.json(updatedFriendship);
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { senderId } = req.body;

  const friendship = await prisma.friendship.findFirst({
    where: {
      senderId,
      receiverId: currentUserId,
      status: 'PENDING',
    },
  });

  if (!friendship) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  const updatedFriendship = await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: 'REJECTED' },
  });

  return res.json(updatedFriendship);
};

export const blockUser = async (req: Request, res: Response) => {};

export const unblockUser = async (req: Request, res: Response) => {};
