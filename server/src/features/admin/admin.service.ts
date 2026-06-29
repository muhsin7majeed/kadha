import { Prisma, UserRole } from '@prisma/client';

import { envConfig } from '@/config/env';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { notFound } from '@/lib/http';
import { AdminOverview, AdminUserDetail, AdminUserListParams, AdminUserSummary } from './admin.types';

type CountByUserId = Map<string, number>;
type UserCountRow = {
  userId: string;
  _count?: true | { _all?: number };
};

const trackedMediaWhere = {
  OR: [{ watched: true }, { liked: true }, { watchlist: true }],
} satisfies Prisma.UserMediaWhereInput;

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

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalUsers,
    newUsersLast7Days,
    newUsersLast30Days,
    totalTrackedMediaRows,
    totalCollections,
    totalFriendships,
    totalNotifications,
    totalAdmins,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.userMedia.count({ where: trackedMediaWhere }),
    prisma.collection.count(),
    prisma.friendship.count({ where: { status: 'ACCEPTED' } }),
    prisma.notification.count(),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
  ]);

  return {
    totalUsers,
    newUsersLast7Days,
    newUsersLast30Days,
    totalTrackedMediaRows,
    totalCollections,
    totalFriendships,
    totalNotifications,
    totalAdmins,
    appName: envConfig.appName,
    appVersion: envConfig.version,
  };
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
        updatedAt: true,
        profilePrivacy: true,
        watchedPrivacy: true,
        likedPrivacy: true,
        watchlistPrivacy: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const counts = await getUserSummaryCounts(users.map((user) => user.id));
  const data: AdminUserSummary[] = users.map((user) => ({
    ...user,
    watchedCount: getCount(counts.watchedCounts, user.id),
    likedCount: getCount(counts.likedCounts, user.id),
    watchlistCount: getCount(counts.watchlistCounts, user.id),
    collectionCount: getCount(counts.collectionCounts, user.id),
    friendCount: getCount(counts.friendCounts, user.id),
  }));

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
