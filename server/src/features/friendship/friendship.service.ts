import { prisma } from '@/lib/prisma';

type FriendshipType = 'friends' | 'sent' | 'received' | 'blocked';

export async function sendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    return { status: 400, body: { message: 'Cannot send friend request to yourself' } };
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

  if (!receiver) {
    return { status: 404, body: { error: 'User not found' } };
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
    return {
      status: 400,
      body: {
        message: 'You are already friends or have already sent a friend request to this user',
        status: existing.status,
      },
    };
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

  return { status: 201, body: friendship };
}

export async function acceptRequest(currentUserId: string, senderId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      senderId,
      receiverId: currentUserId,
      status: 'PENDING',
    },
  });

  if (!friendship) {
    return { status: 404, body: { message: 'Friend request not found' } };
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

  return { status: 200, body: updatedFriendship };
}

export async function rejectRequest(currentUserId: string, senderId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      senderId,
      receiverId: currentUserId,
      status: 'PENDING',
    },
  });

  if (!friendship) {
    return { status: 404, body: { message: 'Friend request not found' } };
  }

  const updatedFriendship = await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: 'REJECTED' },
  });

  return { status: 200, body: updatedFriendship };
}

export async function removeFriend(currentUserId: string, userId: string) {
  if (currentUserId === userId) {
    return { status: 400, body: { message: 'Invalid operation' } };
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
    return { status: 404, body: { message: 'Friendship not found' } };
  }

  await prisma.friendship.delete({
    where: { id: friendship.id },
  });

  return { status: 200, body: { message: 'Friend removed successfully' } };
}

export async function unblockFriend(currentUserId: string, userId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      senderId: currentUserId,
      receiverId: userId,
      status: 'BLOCKED',
    },
  });

  if (!friendship) {
    return { status: 404, body: { message: 'Blocked user not found' } };
  }

  await prisma.friendship.delete({
    where: { id: friendship.id },
  });

  return { status: 200, body: { message: 'User unblocked successfully' } };
}

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

export async function getFriendshipUsers(currentUserId: string, type: FriendshipType) {
  let whereClause: object;

  switch (type) {
    case 'friends':
      whereClause = {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        status: 'ACCEPTED',
      };
      break;
    case 'sent':
      whereClause = {
        senderId: currentUserId,
        status: 'PENDING',
      };
      break;
    case 'received':
      whereClause = {
        receiverId: currentUserId,
        status: 'PENDING',
      };
      break;
    case 'blocked':
      whereClause = {
        senderId: currentUserId,
        status: 'BLOCKED',
      };
      break;
    default:
      return null;
  }

  const friendships = await prisma.friendship.findMany({
    where: whereClause,
    include: {
      sender: true,
      receiver: true,
    },
  });

  return friendships.map((friendship) => transformFriendshipToUser(friendship, currentUserId));
}

export type { FriendshipType };
