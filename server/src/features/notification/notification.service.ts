import { prisma } from '@/lib/prisma';
import { enrichUserWithFriendship, getFriendshipStatusMap } from '@/lib/friendship-utils';

export async function getUserNotifications(currentUserId: string) {
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

  const actorIds = notifications.map((n) => n.actorId).filter((id): id is string => id !== null);
  const statusMap = await getFriendshipStatusMap(currentUserId, actorIds);

  return notifications.map((notification) => {
    if (!notification.actor) return notification;

    return {
      ...notification,
      actor: enrichUserWithFriendship(notification.actor, statusMap),
    };
  });
}
