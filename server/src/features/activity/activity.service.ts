import { Prisma } from '@prisma/client';

import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { CreateUserActivityInput } from './activity.types';

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
