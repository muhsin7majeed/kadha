import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const sendFriendRequest = async (req: Request, res: Response) => {
  const { id: senderId } = req.user;
  const { receiverId } = req.body;

  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
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
    return res.status(400).json({ error: 'Friendship already exists', status: existing.status });
  }

  const friendship = await prisma.friendship.create({
    data: { senderId, receiverId, status: 'PENDING' },
  });

  return res.status(201).json(friendship);
};

export const acceptFriendRequest = async (req: Request, res: Response) => {};

export const rejectFriendRequest = async (req: Request, res: Response) => {};

export const blockUser = async (req: Request, res: Response) => {};

export const unblockUser = async (req: Request, res: Response) => {};
