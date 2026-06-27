import { DataPrivacy } from '@/types/common';
import { enrichUsersWithFriendship } from '@/lib/friendship-utils';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateCurrentUser(id: string, username: string, profilePrivacy: DataPrivacy) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (user && user.id !== id) {
    return { fieldErrors: { username: 'Username already exists' } };
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { username, profilePrivacy },
  });

  return {
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      profilePrivacy: updatedUser.profilePrivacy,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  };
}

export async function searchUsersByUsername(currentUserId: string, query: string) {
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query,
      },
      profilePrivacy: {
        in: [DataPrivacy.Friends, DataPrivacy.Everyone],
      },
      id: {
        not: currentUserId,
      },
      NOT: {
        sentFriendRequests: {
          some: {
            receiverId: currentUserId,
            status: 'BLOCKED',
          },
        },
      },
    },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
    },
  });

  return enrichUsersWithFriendship(currentUserId, users);
}

export async function getUserMediaByFlag(id: string, flag: 'watchlist' | 'liked' | 'watched') {
  return prisma.userMedia.findMany({
    where: {
      userId: id,
      [flag]: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}
