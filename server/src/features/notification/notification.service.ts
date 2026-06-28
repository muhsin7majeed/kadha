import { enrichUserWithFriendship, getFriendshipStatusMap } from '@/lib/friendship-utils';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@/types/common';

type NotificationDelegate = Pick<typeof prisma, 'notification'>;

type NotificationEntityType = 'friendship';

interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  actorId?: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
}

const serializeMetadata = (metadata?: Record<string, unknown>) => (metadata ? JSON.stringify(metadata) : undefined);

const buildFriendshipDedupeKey = (type: NotificationType, friendshipId: string, actorId?: string) => {
  return ['friendship', friendshipId, type, actorId].filter(Boolean).join(':');
};

export const notificationDedupeKeys = {
  friendship: buildFriendshipDedupeKey,
};

export async function createNotification(payload: CreateNotificationPayload, db: NotificationDelegate = prisma) {
  const referenceId = payload.referenceId ?? payload.entityId;
  const data = {
    userId: payload.userId,
    type: payload.type,
    actorId: payload.actorId,
    referenceId,
    entityType: payload.entityType,
    entityId: payload.entityId ?? referenceId,
    dedupeKey: payload.dedupeKey,
    metadata: serializeMetadata(payload.metadata),
    read: false,
    readAt: null,
    resolvedAt: null,
  };

  if (!payload.dedupeKey) {
    return db.notification.create({ data });
  }

  return db.notification.upsert({
    where: {
      userId_dedupeKey: {
        userId: payload.userId,
        dedupeKey: payload.dedupeKey,
      },
    },
    create: data,
    update: {
      ...data,
      createdAt: new Date(),
    },
  });
}

export async function getUserNotifications(currentUserId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const where = {
    userId: currentUserId,
    resolvedAt: null,
  };

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.notification.count({ where }),
  ]);

  const actorIds = notifications.map((n) => n.actorId).filter((id): id is string => id !== null);
  const statusMap = await getFriendshipStatusMap(currentUserId, actorIds);

  return {
    data: notifications.map((notification) => {
      if (!notification.actor) return notification;

      return {
        ...notification,
        actor: enrichUserWithFriendship(notification.actor, statusMap),
      };
    }),
    pagination: createPaginationMeta(page, limit, total),
  };
}

export async function getUnreadNotificationsCount(currentUserId: string) {
  return prisma.notification.count({
    where: {
      userId: currentUserId,
      read: false,
      resolvedAt: null,
    },
  });
}

export async function markNotificationRead(currentUserId: string, notificationId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: currentUserId,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return result.count > 0;
}

export async function markAllNotificationsRead(currentUserId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId: currentUserId,
      read: false,
      resolvedAt: null,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return result.count;
}

export async function resolveNotificationsBetweenUsers(
  firstUserId: string,
  secondUserId: string,
  db: NotificationDelegate = prisma,
) {
  return db.notification.updateMany({
    where: {
      OR: [
        { userId: firstUserId, actorId: secondUserId },
        { userId: secondUserId, actorId: firstUserId },
      ],
      resolvedAt: null,
    },
    data: {
      read: true,
      readAt: new Date(),
      resolvedAt: new Date(),
    },
  });
}

export async function resolveNotificationsByEntity(
  entityType: NotificationEntityType,
  entityId: string,
  db: NotificationDelegate = prisma,
) {
  return db.notification.updateMany({
    where: {
      entityType,
      entityId,
      resolvedAt: null,
    },
    data: {
      read: true,
      readAt: new Date(),
      resolvedAt: new Date(),
    },
  });
}
