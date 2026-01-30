import { prisma } from '@/lib/prisma';

export interface FriendshipInfo {
  friendshipStatus: string | null;
  isRequestSender: boolean;
}

/**
 * Get friendship status between the current user and a list of other users.
 * Use this anywhere we need to display friendship state for other users.
 *
 * @param currentUserId - The logged-in user's ID
 * @param userIds - Array of user IDs to check friendship status for
 * @returns Map of userId -> FriendshipInfo
 */
export const getFriendshipStatusMap = async (
  currentUserId: string,
  userIds: string[],
): Promise<Map<string, FriendshipInfo>> => {
  if (userIds.length === 0) {
    return new Map();
  }

  // Fetch all friendships involving the current user and the target users
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: { in: userIds } },
        { receiverId: currentUserId, senderId: { in: userIds } },
      ],
    },
    select: {
      senderId: true,
      receiverId: true,
      status: true,
    },
  });

  const statusMap = new Map<string, FriendshipInfo>();

  for (const friendship of friendships) {
    const isCurrentUserSender = friendship.senderId === currentUserId;
    const otherUserId = isCurrentUserSender ? friendship.receiverId : friendship.senderId;

    statusMap.set(otherUserId, {
      friendshipStatus: friendship.status,
      isRequestSender: isCurrentUserSender,
    });
  }

  return statusMap;
};

/**
 * Enriches a user object with friendship status.
 * Generic helper that works with any object that has an `id` field.
 */
export const enrichUserWithFriendship = <T extends { id: string }>(
  user: T,
  statusMap: Map<string, FriendshipInfo>,
): T & FriendshipInfo => {
  const friendshipInfo = statusMap.get(user.id) || {
    friendshipStatus: null,
    isRequestSender: false,
  };

  return {
    ...user,
    ...friendshipInfo,
  };
};

/**
 * Enriches an array of users with friendship status in a single batch.
 * This is the most common use case.
 */
export const enrichUsersWithFriendship = async <T extends { id: string }>(
  currentUserId: string,
  users: T[],
): Promise<(T & FriendshipInfo)[]> => {
  const userIds = users.map((u) => u.id);
  const statusMap = await getFriendshipStatusMap(currentUserId, userIds);

  return users.map((user) => enrichUserWithFriendship(user, statusMap));
};
