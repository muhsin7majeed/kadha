import { DataPrivacy } from '@/types/common';
import { enrichUsersWithFriendship, getViewerRelationship } from '@/lib/friendship-utils';
import { prisma } from '@/lib/prisma';
import { canViewByPrivacy, getLockedReason, isBlockingRelationship } from '@/lib/privacy-utils';

type UserMediaFlag = 'watchlist' | 'liked' | 'watched';

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

export async function searchUsersByUsername(currentUserId: string, query: string) {
  const users = await prisma.user.findMany({
    where: {
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
              status: 'BLOCKED',
            },
          },
        },
        {
          receivedFriendRequests: {
            some: {
              senderId: currentUserId,
              status: 'BLOCKED',
            },
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
    },
  });

  return enrichUsersWithFriendship(currentUserId, users);
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
    canViewProfile,
    sections,
    ...(canViewProfile ? {} : { lockedReason: getLockedReason(user.profilePrivacy as DataPrivacy) }),
  };
}

export async function getUserMediaByFlag(id: string, flag: UserMediaFlag) {
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

export async function getUserMediaByUsername(viewerId: string, username: string, flag: UserMediaFlag) {
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
    return {
      data: [],
      canView: false,
      lockedReason: getLockedReason(privacy),
    };
  }

  const data = await getUserMediaByFlag(owner.id, flag);

  return {
    data,
    canView: true,
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

  return {
    data: collections.map(({ items, ...collection }) => ({
      ...collection,
      media: items,
    })),
    canView: true,
  };
}
