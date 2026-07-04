import { UserActivityType } from '@prisma/client';

import { createUserActivity } from '@/features/activity/activity.service';
import { flattenMediaSnapshot } from '@/features/media/media-snapshot.service';
import { envConfig } from '@/config/env';
import { normalizeWatchRegion } from '@/constants/watch-regions';
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

const usernameAlreadyExists = { fieldErrors: { username: 'Username already exists' } };

const publicUserSelect = {
  id: true,
  username: true,
} as const;

export async function exportCurrentUserData(id: string) {
  const [
    account,
    media,
    collections,
    collectionMemberships,
    collectionInvites,
    friendships,
    notifications,
    activity,
  ] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        profilePrivacy: true,
        watchedPrivacy: true,
        likedPrivacy: true,
        watchlistPrivacy: true,
        watchRegion: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.userMedia.findMany({
      where: { userId: id },
      include: {
        media: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.collection.findMany({
      where: { userId: id },
      include: {
        items: {
          include: {
            media: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
        members: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        invites: {
          include: {
            inviter: {
              select: publicUserSelect,
            },
            invitee: {
              select: publicUserSelect,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    }),
    prisma.collectionMember.findMany({
      where: { userId: id },
      include: {
        collection: {
          select: {
            id: true,
            userId: true,
            name: true,
            description: true,
            privacy: true,
            created_at: true,
            updated_at: true,
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.collectionInvite.findMany({
      where: {
        OR: [{ inviterId: id }, { inviteeId: id }],
      },
      include: {
        collection: {
          select: {
            id: true,
            userId: true,
            name: true,
            description: true,
            privacy: true,
            created_at: true,
            updated_at: true,
          },
        },
        inviter: {
          select: publicUserSelect,
        },
        invitee: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ senderId: id }, { receiverId: id }],
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receiver: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.notification.findMany({
      where: { userId: id },
      include: {
        actor: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.userActivity.findMany({
      where: { userId: id },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    app: {
      name: envConfig.appName,
      version: envConfig.version,
    },
    account,
    media: media.map(({ media: mediaSnapshot, ...item }) => ({
      ...item,
      media: mediaSnapshot,
    })),
    collections: collections.map(({ items, ...collection }) => ({
      ...collection,
      items: items.map(({ media: mediaSnapshot, ...item }) => ({
        ...item,
        media: mediaSnapshot,
      })),
    })),
    collectionMemberships,
    collectionInvites,
    friendships,
    notifications,
    activity,
  };
}

export async function getCurrentUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
      watchRegion: true,
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
  watchRegion: string,
) {
  const currentUser = await prisma.user.findUnique({
    where: { id },
    select: {
      username: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
      watchRegion: true,
    },
  });

  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      id: {
        not: id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return usernameAlreadyExists;
  }

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          username,
          profilePrivacy,
          watchedPrivacy,
          likedPrivacy,
          watchlistPrivacy,
          watchRegion: normalizeWatchRegion(watchRegion),
        },
      });

      if (
        currentUser &&
        (currentUser.username !== user.username ||
          currentUser.profilePrivacy !== user.profilePrivacy ||
          currentUser.watchedPrivacy !== user.watchedPrivacy ||
          currentUser.likedPrivacy !== user.likedPrivacy ||
          currentUser.watchlistPrivacy !== user.watchlistPrivacy ||
          currentUser.watchRegion !== user.watchRegion)
      ) {
        await createUserActivity(
          {
            userId: id,
            type: UserActivityType.PROFILE_UPDATED,
            metadata: {
              title: user.username,
            },
          },
          tx,
        );
      }

      return user;
    });

    return {
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        profilePrivacy: updatedUser.profilePrivacy,
        watchedPrivacy: updatedUser.watchedPrivacy,
        likedPrivacy: updatedUser.likedPrivacy,
        watchlistPrivacy: updatedUser.watchlistPrivacy,
        watchRegion: updatedUser.watchRegion,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return usernameAlreadyExists;
    }

    throw error;
  }
}

export async function searchUsersByUsername(currentUserId: string, query: string, page: number, limit: number) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      data: [],
      pagination: createPaginationMeta(1, limit, 0),
    };
  }

  const where = {
    username: {
      contains: normalizedQuery,
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
        [`${flag}At`]: 'desc',
      },
      include: {
        media: true,
      },
    }),
    prisma.userMedia.count({ where }),
  ]);

  return {
    data: data.map(flattenMediaSnapshot),
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
      items: {
        include: {
          media: true,
        },
      },
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  return viewableResource(
    collections.map(({ items, ...collection }) => ({
      ...collection,
      media: items.map(flattenMediaSnapshot),
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
