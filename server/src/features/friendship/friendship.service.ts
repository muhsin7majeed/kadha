import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@/types/common';
import {
  createNotification,
  notificationDedupeKeys,
  resolveNotificationsBetweenUsers,
  resolveNotificationsByEntity,
} from '../notification/notification.service';

type FriendshipType = 'friends' | 'sent' | 'received' | 'blocked';

export async function sendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    return { status: 400, body: { message: 'Cannot send friend request to yourself' } };
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

  if (!receiver) {
    return { status: 404, body: { message: 'User not found' } };
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  let rejectedFriendshipId: string | null = null;

  if (existing) {
    if (existing.status === 'BLOCKED') {
      return {
        status: 403,
        body: { message: 'Cannot send friend request' },
      };
    }

    if (existing.status === 'REJECTED') {
      rejectedFriendshipId = existing.id;
    } else {
      return {
        status: 400,
        body: {
          message: 'You are already friends or have already sent a friend request to this user',
          status: existing.status,
        },
      };
    }
  }

  const friendship = await prisma.$transaction(async (tx) => {
    if (rejectedFriendshipId) {
      await tx.friendship.delete({ where: { id: rejectedFriendshipId } });
      await resolveNotificationsBetweenUsers(senderId, receiverId, tx);
    }

    const createdFriendship = await tx.friendship.create({
      data: { senderId, receiverId, status: 'PENDING' },
    });

    await createNotification(
      {
        userId: receiverId,
        type: NotificationType.FriendRequestReceived,
        actorId: senderId,
        entityType: 'friendship',
        entityId: createdFriendship.id,
        dedupeKey: notificationDedupeKeys.friendship(
          NotificationType.FriendRequestReceived,
          createdFriendship.id,
          senderId,
        ),
      },
      tx,
    );

    return createdFriendship;
  });

  return { status: 201, body: friendship };
}

export async function blockFriend(currentUserId: string, userId: string) {
  if (currentUserId === userId) {
    return {
      status: 400,
      body: { message: 'Invalid operation' },
    };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { status: 404, body: { message: 'User not found' } };
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    },
  });

  if (existing) {
    if (existing.senderId === currentUserId && existing.status === 'BLOCKED') {
      return { status: 200, body: existing };
    }

    if (existing.receiverId === currentUserId && existing.status === 'BLOCKED') {
      return { status: 403, body: { message: 'Cannot block user' } };
    }
  }

  const blocked = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.friendship.delete({ where: { id: existing.id } });
    }

    const blockedFriendship = await tx.friendship.create({
      data: {
        senderId: currentUserId,
        receiverId: userId,
        status: 'BLOCKED',
      },
    });

    await resolveNotificationsBetweenUsers(currentUserId, userId, tx);

    return blockedFriendship;
  });

  return { status: 200, body: blocked };
}

export async function acceptRequest(currentUserId: string, senderId: string) {
  const blocker = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: senderId, status: 'BLOCKED' },
        { senderId, receiverId: currentUserId, status: 'BLOCKED' },
      ],
    },
  });

  if (blocker) {
    return { status: 403, body: { message: 'Cannot accept friend request' } };
  }

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

  const updatedFriendship = await prisma.$transaction(async (tx) => {
    const acceptedFriendship = await tx.friendship.update({
      where: { id: friendship.id },
      data: { status: 'ACCEPTED' },
    });

    await resolveNotificationsByEntity('friendship', friendship.id, tx);

    await createNotification(
      {
        userId: senderId,
        type: NotificationType.FriendRequestAccepted,
        actorId: currentUserId,
        entityType: 'friendship',
        entityId: friendship.id,
        dedupeKey: notificationDedupeKeys.friendship(
          NotificationType.FriendRequestAccepted,
          friendship.id,
          currentUserId,
        ),
      },
      tx,
    );

    return acceptedFriendship;
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

  const updatedFriendship = await prisma.$transaction(async (tx) => {
    const rejectedFriendship = await tx.friendship.update({
      where: { id: friendship.id },
      data: { status: 'REJECTED' },
    });

    await resolveNotificationsByEntity('friendship', friendship.id, tx);

    return rejectedFriendship;
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

  await prisma.$transaction(async (tx) => {
    await tx.friendship.delete({
      where: { id: friendship.id },
    });

    await resolveNotificationsBetweenUsers(currentUserId, userId, tx);
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

export async function getFriendshipUsers(currentUserId: string, type: FriendshipType, page: number, limit: number) {
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

  const skip = (page - 1) * limit;
  const [friendships, total] = await prisma.$transaction([
    prisma.friendship.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        sender: true,
        receiver: true,
      },
    }),
    prisma.friendship.count({ where: whereClause }),
  ]);

  return {
    data: friendships.map((friendship) => transformFriendshipToUser(friendship, currentUserId)),
    pagination: createPaginationMeta(page, limit, total),
  };
}

export type { FriendshipType };
