import { Prisma, UserActivityType, UserRole } from '@prisma/client';

import { createUserActivity } from '@/features/activity/activity.service';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { conflict, forbidden, notFound } from '@/lib/http';
import { AdminUserDetail, AdminUserListParams, AdminUserSummary } from './admin.types';

type CountByUserId = Map<string, number>;
type UserCountRow = {
  userId: string;
  _count?: true | { _all?: number };
};

const countByUserId = (rows: UserCountRow[]): CountByUserId =>
  new Map(
    rows.map((row) => [
      row.userId,
      typeof row._count === 'object' && row._count !== null ? (row._count._all ?? 0) : 0,
    ]),
  );

const getCount = (counts: CountByUserId, userId: string) => counts.get(userId) ?? 0;

async function getUserSummaryCounts(userIds: string[]) {
  if (userIds.length === 0) {
    return {
      watchedCounts: new Map<string, number>(),
      likedCounts: new Map<string, number>(),
      watchlistCounts: new Map<string, number>(),
      collectionCounts: new Map<string, number>(),
      friendCounts: new Map<string, number>(),
    };
  }

  const userIdSet = new Set(userIds);
  const [watchedRows, likedRows, watchlistRows, collectionRows, friendships] = await prisma.$transaction([
    prisma.userMedia.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, watched: true },
      orderBy: { userId: 'asc' },
      _count: { _all: true },
    }),
    prisma.userMedia.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, liked: true },
      orderBy: { userId: 'asc' },
      _count: { _all: true },
    }),
    prisma.userMedia.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, watchlist: true },
      orderBy: { userId: 'asc' },
      _count: { _all: true },
    }),
    prisma.collection.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      orderBy: { userId: 'asc' },
      _count: { _all: true },
    }),
    prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    }),
  ]);

  const friendCounts = new Map<string, number>();

  friendships.forEach((friendship) => {
    if (userIdSet.has(friendship.senderId)) {
      friendCounts.set(friendship.senderId, (friendCounts.get(friendship.senderId) ?? 0) + 1);
    }

    if (userIdSet.has(friendship.receiverId)) {
      friendCounts.set(friendship.receiverId, (friendCounts.get(friendship.receiverId) ?? 0) + 1);
    }
  });

  return {
    watchedCounts: countByUserId(watchedRows),
    likedCounts: countByUserId(likedRows),
    watchlistCounts: countByUserId(watchlistRows),
    collectionCounts: countByUserId(collectionRows),
    friendCounts,
  };
}

export async function updateAdminUserRole(actorId: string, targetId: string, role: UserRole) {
  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: targetId },
      select: { id: true, username: true, role: true },
    });

    if (!target) {
      throw notFound('User not found');
    }

    if (actorId === targetId && target.role !== role) {
      throw forbidden('You cannot change your own role');
    }

    if (target.role === role) {
      return target;
    }

    if (target.role === UserRole.ADMIN && role === UserRole.USER) {
      const adminCount = await tx.user.count({ where: { role: UserRole.ADMIN } });

      if (adminCount <= 1) {
        throw conflict('At least one administrator must remain');
      }
    }

    const updatedUser = await tx.user.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    await createUserActivity(
      {
        userId: actorId,
        type: UserActivityType.ADMIN_ROLE_CHANGED,
        metadata: {
          targetUserId: target.id,
          targetUsername: target.username,
          previousRole: target.role,
          newRole: updatedUser.role,
        },
      },
      tx,
    );

    return updatedUser;
  });
}

export async function getAdminUsers(params: AdminUserListParams) {
  const normalizedQuery = params.query.trim();
  const where: Prisma.UserWhereInput = {
    ...(normalizedQuery ? { username: { contains: normalizedQuery } } : {}),
    ...(params.role ? { role: params.role } : {}),
  };
  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.UserOrderByWithRelationInput = {
    [params.sort]: params.order,
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: params.limit,
      orderBy,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data: AdminUserSummary[] = users;

  return {
    data,
    pagination: createPaginationMeta(params.page, params.limit, total),
  };
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
    },
  });

  if (!user) {
    throw notFound('User not found');
  }

  const [counts, pendingSentFriendRequestCount, pendingReceivedFriendRequestCount] = await Promise.all([
    getUserSummaryCounts([id]),
    prisma.friendship.count({
      where: {
        senderId: id,
        status: 'PENDING',
      },
    }),
    prisma.friendship.count({
      where: {
        receiverId: id,
        status: 'PENDING',
      },
    }),
  ]);

  return {
    ...user,
    watchedCount: getCount(counts.watchedCounts, id),
    likedCount: getCount(counts.likedCounts, id),
    watchlistCount: getCount(counts.watchlistCounts, id),
    collectionCount: getCount(counts.collectionCounts, id),
    friendCount: getCount(counts.friendCounts, id),
    pendingSentFriendRequestCount,
    pendingReceivedFriendRequestCount,
  };
}
