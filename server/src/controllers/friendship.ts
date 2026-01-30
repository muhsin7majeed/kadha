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

export const unfriend = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { userId } = req.body;

  if (currentUserId === userId) {
    return res.status(400).json({ message: 'Invalid operation' });
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
      status: 'ACCEPTED',
    },
  });

  if (!friendship) {
    return res.status(404).json({ message: 'Friendship not found' });
  }

  await prisma.friendship.delete({
    where: { id: friendship.id },
  });

  return res.json({ message: 'Friend removed successfully' });
};

export const blockUser = async (req: Request, res: Response) => {};

export const unblockUser = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { userId } = req.body;

  const friendship = await prisma.friendship.findFirst({
    where: {
      senderId: currentUserId,
      receiverId: userId,
      status: 'BLOCKED',
    },
  });

  if (!friendship) {
    return res.status(404).json({ message: 'Blocked user not found' });
  }

  await prisma.friendship.delete({
    where: { id: friendship.id },
  });

  return res.json({ message: 'User unblocked successfully' });
};

type FriendshipType = 'friends' | 'sent' | 'received' | 'blocked';

// Helper to transform friendship to user data
const transformFriendshipToUser = (
  friendship: {
    senderId: string;
    sender: { id: string; username: string };
    receiver: { id: string; username: string };
  },
  currentUserId: string,
) => {
  const friend = friendship.senderId === currentUserId ? friendship.receiver : friendship.sender;
  return {
    id: friend.id,
    username: friend.username,
  };
};

export const getFriendships = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const type = (req.query.type as FriendshipType) || 'friends';

  let whereClause: object;

  switch (type) {
    case 'friends':
      // Accepted friendships where user is either sender or receiver
      whereClause = {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        status: 'ACCEPTED',
      };
      break;
    case 'sent':
      // Pending requests sent by current user
      whereClause = {
        senderId: currentUserId,
        status: 'PENDING',
      };
      break;
    case 'received':
      // Pending requests received by current user
      whereClause = {
        receiverId: currentUserId,
        status: 'PENDING',
      };
      break;
    case 'blocked':
      // Users blocked by current user
      whereClause = {
        senderId: currentUserId,
        status: 'BLOCKED',
      };
      break;
    default:
      return res.status(400).json({ message: 'Invalid friendship type' });
  }

  const friendships = await prisma.friendship.findMany({
    where: whereClause,
    include: {
      sender: true,
      receiver: true,
    },
  });

  const users = friendships.map((friendship) => transformFriendshipToUser(friendship, currentUserId));

  res.json({ data: users });
};
