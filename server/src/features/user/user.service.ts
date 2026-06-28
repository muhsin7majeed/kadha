import { DataPrivacy, LockedReason, ResourceAccessResponse } from '@/types/common';
import { enrichUsersWithFriendship, getViewerRelationship } from '@/lib/friendship-utils';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { canViewByPrivacy, getLockedReason, isBlockingRelationship } from '@/lib/privacy-utils';

type UserMediaFlag = 'watchlist' | 'liked' | 'watched';

const viewableResource = <T>(data: T): ResourceAccessResponse<T> => ({
  data,
  access: {
    canView: true,
  },
});

export const lockedResource = (lockedReason: LockedReason): ResourceAccessResponse<[]> => ({
  data: [],
  access: {
    canView: false,
    lockedReason,
  },
});

const privacyFieldByFlag = {
  watched: 'watchedPrivacy',
  liked: 'likedPrivacy',
  watchlist: 'watchlistPrivacy',
} as const satisfies Record<UserMediaFlag, 'watchedPrivacy' | 'likedPrivacy' | 'watchlistPrivacy'>;

export async function getCurrentUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateCurrentUser(
  id: string,
  username: string,
  profilePrivacy: DataPrivacy,
  watchedPrivacy: DataPrivacy,
  likedPrivacy: DataPrivacy,
  watchlistPrivacy: DataPrivacy,
) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (user && user.id !== id) {
    return { fieldErrors: { username: 'Username already exists' } };
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { username, profilePrivacy, watchedPrivacy, likedPrivacy, watchlistPrivacy },
  });

  return {
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      profilePrivacy: updatedUser.profilePrivacy,
      watchedPrivacy: updatedUser.watchedPrivacy,
      likedPrivacy: updatedUser.likedPrivacy,
      watchlistPrivacy: updatedUser.watchlistPrivacy,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  };
}

export async function searchUsersByUsername(currentUserId: string, query: string, page: number, limit: number) {
  const where = {
    username: {
      contains: query,
    },
    id: {
      not: currentUserId,
    },
    NOT: [
      {
        sentFriendRequests: {
          some: {
            receiverId: currentUserId,
            status: 'BLOCKED' as const,
          },
        },
      },
      {
        receivedFriendRequests: {
          some: {
            senderId: currentUserId,
            status: 'BLOCKED' as const,
          },
        },
      },
    ],
  };
  const skip = (page - 1) * limit;
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        username: 'asc',
      },
      select: {
        id: true,
        username: true,
        profilePrivacy: true,
        watchedPrivacy: true,
        likedPrivacy: true,
        watchlistPrivacy: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: await enrichUsersWithFriendship(currentUserId, users),
    pagination: createPaginationMeta(page, limit, total),
  };
}

export async function getUserProfileByUsername(viewerId: string, username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
    },
  });

  if (!user) {
    return null;
  }

  const relationship = await getViewerRelationship(viewerId, user.id);

  if (isBlockingRelationship(relationship.friendshipStatus)) {
    return { blocked: true as const };
  }

  const areFriends = relationship.friendshipStatus === 'ACCEPTED';
  const canViewProfile = canViewByPrivacy({
    viewerId,
    ownerId: user.id,
    privacy: user.profilePrivacy as DataPrivacy,
    areFriends,
  });
  const sections = {
    watched: canViewByPrivacy({
      viewerId,
      ownerId: user.id,
      privacy: user.watchedPrivacy as DataPrivacy,
      areFriends,
    }),
    liked: canViewByPrivacy({
      viewerId,
      ownerId: user.id,
      privacy: user.likedPrivacy as DataPrivacy,
      areFriends,
    }),
    watchlist: canViewByPrivacy({
      viewerId,
      ownerId: user.id,
      privacy: user.watchlistPrivacy as DataPrivacy,
      areFriends,
    }),
    collections: true,
  };

  return {
    id: user.id,
    username: user.username,
    profilePrivacy: user.profilePrivacy,
    friendshipStatus: relationship.friendshipStatus,
    isRequestSender: relationship.isRequestSender,
    access: {
      canView: canViewProfile,
      ...(canViewProfile ? {} : { lockedReason: getLockedReason(user.profilePrivacy as DataPrivacy) }),
    },
    sections,
  };
}

export async function getUserMediaByFlag(id: string, flag: UserMediaFlag, page: number, limit: number) {
  const where = {
    userId: id,
    [flag]: true,
  };
  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.userMedia.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.userMedia.count({ where }),
  ]);

  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
}

export async function getUserMediaByUsername(
  viewerId: string,
  username: string,
  flag: UserMediaFlag,
  page: number,
  limit: number,
) {
  const owner = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
    },
  });

  if (!owner) {
    return null;
  }

  const relationship = await getViewerRelationship(viewerId, owner.id);

  if (isBlockingRelationship(relationship.friendshipStatus)) {
    return { blocked: true as const };
  }

  const privacy = owner[privacyFieldByFlag[flag]] as DataPrivacy;
  const canView = canViewByPrivacy({
    viewerId,
    ownerId: owner.id,
    privacy,
    areFriends: relationship.friendshipStatus === 'ACCEPTED',
  });

  if (!canView) {
    return lockedResource(getLockedReason(privacy));
  }

  const result = await getUserMediaByFlag(owner.id, flag, page, limit);

  return {
    ...viewableResource(result.data),
    pagination: result.pagination,
  };
}

export async function getUserCollectionsByUsername(viewerId: string, username: string) {
  const owner = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!owner) {
    return null;
  }

  const relationship = await getViewerRelationship(viewerId, owner.id);

  if (isBlockingRelationship(relationship.friendshipStatus)) {
    return { blocked: true as const };
  }

  const isOwner = viewerId === owner.id;
  const isFriend = relationship.friendshipStatus === 'ACCEPTED';

  const collections = await prisma.collection.findMany({
    where: {
      userId: owner.id,
      ...(isOwner
        ? {}
        : {
            OR: [
              { privacy: DataPrivacy.Everyone },
              ...(isFriend ? [{ privacy: DataPrivacy.Friends }] : []),
            ],
          }),
    },
    include: {
      items: true,
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  return viewableResource(
    collections.map(({ items, ...collection }) => ({
      ...collection,
      media: items,
    })),
  );
}

export const getCurrentUserMediaByFlag = async (id: string, flag: UserMediaFlag, page: number, limit: number) => {
  const result = await getUserMediaByFlag(id, flag, page, limit);

  return {
    ...viewableResource(result.data),
    pagination: result.pagination,
  };
};
