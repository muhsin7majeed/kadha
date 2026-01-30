import { prisma } from '@/lib/prisma';
import { getFriendshipStatusMap, enrichUserWithFriendship } from '@/lib/friendship-utils';
import { Request, Response } from 'express';

export const getNotifications = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: currentUserId,
    },
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
  });

  // Get friendship status for all actors
  const actorIds = notifications.map((n) => n.actorId).filter((id): id is string => id !== null);
  const statusMap = await getFriendshipStatusMap(currentUserId, actorIds);

  // Enrich notifications with actor friendship status
  const enrichedNotifications = notifications.map((notification) => {
    if (!notification.actor) return notification;

    return {
      ...notification,
      actor: enrichUserWithFriendship(notification.actor, statusMap),
    };
  });

  res.json({ data: enrichedNotifications });
};
