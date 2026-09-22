import { Prisma } from '@prisma/client';

import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { CreateUserActivityInput, RecordedActivitySummary } from './activity.types';

type ActivityDelegate = Pick<typeof prisma, 'userActivity'> | Pick<Prisma.TransactionClient, 'userActivity'>;

const serializeMetadata = (metadata?: CreateUserActivityInput['metadata']) =>
  metadata ? JSON.stringify(metadata) : undefined;

export async function createUserActivity(input: CreateUserActivityInput, db: ActivityDelegate = prisma) {
  return db.userActivity.create({
    data: {
      userId: input.userId,
      type: input.type,
      media_id: input.media_id,
      media_type: input.media_type,
      collectionId: input.collectionId,
      metadata: serializeMetadata(input.metadata),
    },
  });
}

export async function getRecordedActivitySummary(
  from: Date,
  recentFrom: Date,
  to: Date,
): Promise<RecordedActivitySummary> {
  const activities = await prisma.userActivity.findMany({
    where: { createdAt: { gte: from, lt: to } },
    select: { userId: true, createdAt: true },
  });
  const distinctUsers = new Set<string>();
  const recentDistinctUsers = new Set<string>();
  const dailyUsers = new Map<string, Set<string>>();

  activities.forEach((activity) => {
    distinctUsers.add(activity.userId);
    if (activity.createdAt >= recentFrom) recentDistinctUsers.add(activity.userId);

    const date = activity.createdAt.toISOString().slice(0, 10);
    const users = dailyUsers.get(date) ?? new Set<string>();
    users.add(activity.userId);
    dailyUsers.set(date, users);
  });

  return {
    distinctUserCount: distinctUsers.size,
    recentDistinctUserCount: recentDistinctUsers.size,
    daily: [...dailyUsers.entries()].map(([date, users]) => ({ date, userCount: users.size })),
  };
}

export async function getUserActivity(ownerId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const where = {
    userId: ownerId,
  };

  const [data, total] = await prisma.$transaction([
    prisma.userActivity.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.userActivity.count({ where }),
  ]);

  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
}
