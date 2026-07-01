import { CollectionInviteStatus, CollectionMemberRole, FriendStatus, Prisma, UserActivityType } from '@prisma/client';

import { createUserActivity } from '@/features/activity/activity.service';
import { flattenMediaSnapshot, upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
import {
  createNotification,
  notificationDedupeKeys,
  resolveNotificationsByEntity,
} from '@/features/notification/notification.service';
import { badRequest, forbidden, notFound } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@/types/common';
import {
  CollectionPayload,
  CreateCollectionInvitePayload,
  GetCollectionsQuery,
  RespondToCollectionInvitePayload,
  ToggleCollectionPayload,
  UpdateCollectionMemberPayload,
} from './collection.schema';

type CollectionAccess =
  | { relationship: 'owner'; role: 'owner'; canView: true; canEditItems: true; canManageSharing: true }
  | {
      relationship: 'member';
      role: 'viewer' | 'editor';
      canView: true;
      canEditItems: boolean;
      canManageSharing: false;
    };

const roleToApi = (role: CollectionMemberRole) => (role === CollectionMemberRole.EDITOR ? 'editor' : 'viewer');
const roleFromApi = (role: 'viewer' | 'editor') =>
  role === 'editor' ? CollectionMemberRole.EDITOR : CollectionMemberRole.VIEWER;

const selectUserSummary = {
  id: true,
  username: true,
} satisfies Prisma.UserSelect;

const collectionListInclude = {
  user: { select: selectUserSummary },
  members: {
    include: {
      user: { select: selectUserSummary },
    },
  },
  _count: {
    select: {
      items: true,
      members: true,
    },
  },
} satisfies Prisma.CollectionInclude;

const collectionDetailsInclude = {
  user: { select: selectUserSummary },
  members: {
    include: {
      user: { select: selectUserSummary },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  items: {
    include: {
      media: true,
    },
  },
  _count: {
    select: {
      members: true,
    },
  },
} satisfies Prisma.CollectionInclude;

type CollectionWithListData = Prisma.CollectionGetPayload<{ include: typeof collectionListInclude }>;
type CollectionWithDetailsData = Prisma.CollectionGetPayload<{ include: typeof collectionDetailsInclude }>;

const getCollectionAccessFromMembers = (collection: CollectionWithListData | CollectionWithDetailsData, userId: string) => {
  if (collection.userId === userId) {
    return {
      relationship: 'owner',
      role: 'owner',
      canView: true,
      canEditItems: true,
      canManageSharing: true,
    } satisfies CollectionAccess;
  }

  const membership = collection.members.find((member) => member.userId === userId);

  if (!membership) {
    return null;
  }

  const role = roleToApi(membership.role);

  return {
    relationship: 'member',
    role,
    canView: true,
    canEditItems: role === 'editor',
    canManageSharing: false,
  } satisfies CollectionAccess;
};

const serializeCollectionListItem = (collection: CollectionWithListData, userId: string) => {
  const access = getCollectionAccessFromMembers(collection, userId);

  if (!access) return null;

  const { user, members, _count, ...rest } = collection as CollectionWithListData & { items?: unknown };
  delete rest.items;

  return {
    ...rest,
    owner: user,
    members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: roleToApi(member.role),
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user,
    })),
    itemCount: _count.items,
    memberCount: _count.members + 1,
    access,
  };
};

const serializeCollectionDetails = (collection: CollectionWithDetailsData, userId: string) => {
  const access = getCollectionAccessFromMembers(collection, userId);

  if (!access) return null;

  const { user, members, items, _count, ...rest } = collection;

  return {
    ...rest,
    owner: user,
    members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: roleToApi(member.role),
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user,
    })),
    memberCount: _count.members + 1,
    access,
    media: items.map((item) => ({
      ...flattenMediaSnapshot(item),
      addedByUserId: item.addedByUserId,
    })),
  };
};

const getCollectionForAccess = async (collectionId: string) => {
  return prisma.collection.findUnique({
    where: { id: collectionId },
    include: collectionDetailsInclude,
  });
};

const requireCollectionAccess = async (userId: string, collectionId: string) => {
  const collection = await getCollectionForAccess(collectionId);

  if (!collection) {
    throw notFound('Collection not found');
  }

  const access = getCollectionAccessFromMembers(collection, userId);

  if (!access) {
    throw forbidden('You do not have access to this collection');
  }

  return { collection, access };
};

const requireCollectionOwner = async (userId: string, collectionId: string) => {
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      userId,
    },
  });

  if (!collection) {
    throw notFound('Collection not found');
  }

  return collection;
};

const blockedRelationshipWhere = (currentUserId: string) => [
  {
    sentFriendRequests: {
      some: {
        receiverId: currentUserId,
        status: FriendStatus.BLOCKED,
      },
    },
  },
  {
    receivedFriendRequests: {
      some: {
        senderId: currentUserId,
        status: FriendStatus.BLOCKED,
      },
    },
  },
];

const hasBlockedRelationship = async (firstUserId: string, secondUserId: string) => {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: FriendStatus.BLOCKED,
      OR: [
        { senderId: firstUserId, receiverId: secondUserId },
        { senderId: secondUserId, receiverId: firstUserId },
      ],
    },
    select: {
      id: true,
    },
  });

  return friendship !== null;
};

export async function getUserCollections(userId: string, query: GetCollectionsQuery) {
  const { mediaId, mediaType, scope } = query;
  const parsedMediaId = mediaId ? Number.parseInt(mediaId, 10) : null;
  const includeMediaState = Number.isInteger(parsedMediaId) && mediaType;

  const where: Prisma.CollectionWhereInput =
    scope === 'mine'
      ? { userId }
      : scope === 'shared'
        ? { members: { some: { userId } } }
        : {
            OR: [{ userId }, { members: { some: { userId } } }],
          };

  const collections = await prisma.collection.findMany({
    where,
    include: {
      ...collectionListInclude,
      ...(includeMediaState
        ? {
            items: {
              where: {
                media_id: parsedMediaId!,
                media_type: mediaType,
              },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  const serialized = collections
    .map((collection) => serializeCollectionListItem(collection, userId))
    .filter((collection): collection is NonNullable<typeof collection> => collection !== null);

  if (!includeMediaState) {
    return serialized;
  }

  const hasMediaByCollectionId = new Map(
    collections.map((collection) => {
      const maybeWithItems = collection as CollectionWithListData & { items?: { id: string }[] };
      return [collection.id, (maybeWithItems.items ?? []).length > 0];
    }),
  );

  return serialized
    .filter((collection) => collection.access.canEditItems)
    .map((collection) => ({
      ...collection,
      hasMedia: hasMediaByCollectionId.get(collection.id) ?? false,
    }));
}

export async function createUserCollection(userId: string, payload: CollectionPayload) {
  const { name, description, privacy } = payload;

  return prisma.$transaction(async (tx) => {
    const collection = await tx.collection.create({
      data: {
        name,
        description,
        privacy,
        userId,
      },
    });

    await createUserActivity(
      {
        userId,
        type: UserActivityType.COLLECTION_CREATED,
        collectionId: collection.id,
        metadata: {
          collectionName: collection.name,
          collectionDescription: collection.description,
          collectionPrivacy: collection.privacy,
        },
      },
      tx,
    );

    return collection;
  });
}

export async function getUserCollection(userId: string, collectionId: string) {
  const { collection } = await requireCollectionAccess(userId, collectionId);

  return serializeCollectionDetails(collection, userId);
}

export async function updateUserCollection(userId: string, collectionId: string, payload: CollectionPayload) {
  const { name, description, privacy } = payload;

  return prisma.$transaction(async (tx) => {
    const existingCollection = await tx.collection.findUnique({
      where: {
        id: collectionId,
        userId,
      },
    });

    if (!existingCollection) {
      throw notFound('Collection not found');
    }

    const collection = await tx.collection.update({
      where: {
        id: collectionId,
        userId,
      },
      data: {
        name,
        description,
        privacy,
      },
    });

    if (
      existingCollection.name !== collection.name ||
      existingCollection.description !== collection.description ||
      existingCollection.privacy !== collection.privacy
    ) {
      await createUserActivity(
        {
          userId,
          type: UserActivityType.COLLECTION_UPDATED,
          collectionId: collection.id,
          metadata: {
            collectionName: collection.name,
            collectionDescription: collection.description,
            collectionPrivacy: collection.privacy,
          },
        },
        tx,
      );
    }

    return collection;
  });
}

export async function deleteUserCollection(userId: string, collectionId: string) {
  return prisma.$transaction(async (tx) => {
    const collection = await tx.collection.findUnique({
      where: {
        id: collectionId,
        userId,
      },
    });

    if (!collection) {
      throw notFound('Collection not found');
    }

    await tx.collection.delete({
      where: {
        id: collectionId,
        userId,
      },
    });

    await createUserActivity(
      {
        userId,
        type: UserActivityType.COLLECTION_DELETED,
        collectionId: collection.id,
        metadata: {
          collectionName: collection.name,
          collectionDescription: collection.description,
          collectionPrivacy: collection.privacy,
        },
      },
      tx,
    );

    return collection;
  });
}

export async function toggleUserCollectionItem(userId: string, collectionId: string, payload: ToggleCollectionPayload) {
  const { collection, access } = await requireCollectionAccess(userId, collectionId);

  if (!access.canEditItems) {
    throw forbidden('You cannot edit items in this collection');
  }

  const mediaId = payload.media_id ?? payload.id;

  if (!mediaId) {
    throw badRequest('Media ID is required', { media_id: 'Media ID is required' });
  }

  const existingItem = await prisma.collectionItem.findUnique({
    where: {
      collectionId_media_id_media_type: {
        collectionId,
        media_id: mediaId,
        media_type: payload.media_type,
      },
    },
  });

  if (existingItem) {
    await prisma.$transaction(async (tx) => {
      const removedItem = await tx.collectionItem.delete({
        where: { id: existingItem.id },
        include: {
          media: true,
        },
      });
      const removedMedia = flattenMediaSnapshot(removedItem);

      await createUserActivity(
        {
          userId,
          type: UserActivityType.COLLECTION_ITEM_REMOVED,
          media_id: removedItem.media_id,
          media_type: removedItem.media_type,
          collectionId,
          metadata: {
            title: removedMedia.title,
            poster_path: removedMedia.poster_path,
            collectionName: collection.name,
          },
        },
        tx,
      );
    });

    return { data: null, removed: true };
  }

  const collectionItem = await prisma.$transaction(async (tx) => {
    await upsertMediaSnapshot({ ...payload, media_id: mediaId }, tx);

    const createdItem = await tx.collectionItem.create({
      data: {
        collectionId,
        media_id: mediaId,
        media_type: payload.media_type,
        addedByUserId: userId,
      },
      include: {
        media: true,
      },
    });
    const createdMedia = flattenMediaSnapshot(createdItem);

    await createUserActivity(
      {
        userId,
        type: UserActivityType.COLLECTION_ITEM_ADDED,
        media_id: createdItem.media_id,
        media_type: createdItem.media_type,
        collectionId,
        metadata: {
          title: createdMedia.title,
          poster_path: createdMedia.poster_path,
          collectionName: collection.name,
        },
      },
      tx,
    );

    return createdMedia;
  });

  return { data: collectionItem, added: true };
}

export async function searchUsersForCollectionInvite(ownerId: string, collectionId: string, query: string) {
  await requireCollectionOwner(ownerId, collectionId);

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: ownerId,
      },
      username: {
        contains: normalizedQuery,
      },
      NOT: blockedRelationshipWhere(ownerId),
    },
    select: selectUserSummary,
    orderBy: {
      username: 'asc',
    },
    take: 10,
  });

  const userIds = users.map((user) => user.id);
  const [members, pendingInvites] = await prisma.$transaction([
    prisma.collectionMember.findMany({
      where: {
        collectionId,
        userId: {
          in: userIds,
        },
      },
    }),
    prisma.collectionInvite.findMany({
      where: {
        collectionId,
        inviteeId: {
          in: userIds,
        },
        status: CollectionInviteStatus.PENDING,
      },
    }),
  ]);

  const memberByUserId = new Map(members.map((member) => [member.userId, member]));
  const pendingInviteByUserId = new Map(pendingInvites.map((invite) => [invite.inviteeId, invite]));

  return users.map((user) => {
    const member = memberByUserId.get(user.id);
    const pendingInvite = pendingInviteByUserId.get(user.id);

    return {
      ...user,
      state: member ? 'member' : pendingInvite ? 'pending' : 'available',
      currentRole: member ? roleToApi(member.role) : pendingInvite ? roleToApi(pendingInvite.role) : undefined,
    };
  });
}

export async function createCollectionInvite(
  ownerId: string,
  collectionId: string,
  payload: CreateCollectionInvitePayload,
) {
  const collection = await requireCollectionOwner(ownerId, collectionId);

  if (payload.inviteeId === ownerId) {
    throw badRequest('You cannot invite yourself', { inviteeId: 'You cannot invite yourself' });
  }

  const invitee = await prisma.user.findUnique({
    where: { id: payload.inviteeId },
    select: selectUserSummary,
  });

  if (!invitee) {
    throw notFound('User not found');
  }

  if (await hasBlockedRelationship(ownerId, payload.inviteeId)) {
    throw notFound('User not found');
  }

  const existingMember = await prisma.collectionMember.findUnique({
    where: {
      collectionId_userId: {
        collectionId,
        userId: payload.inviteeId,
      },
    },
  });

  if (existingMember) {
    throw badRequest('User is already a member', { inviteeId: 'User is already a member' });
  }

  const existingPendingInvite = await prisma.collectionInvite.findFirst({
    where: {
      collectionId,
      inviteeId: payload.inviteeId,
      status: CollectionInviteStatus.PENDING,
    },
  });

  if (existingPendingInvite) {
    throw badRequest('User already has a pending invitation', { inviteeId: 'User already has a pending invitation' });
  }

  return prisma.$transaction(async (tx) => {
    const invite = await tx.collectionInvite.create({
      data: {
        collectionId,
        inviterId: ownerId,
        inviteeId: payload.inviteeId,
        role: roleFromApi(payload.role),
      },
      include: {
        invitee: {
          select: selectUserSummary,
        },
        inviter: {
          select: selectUserSummary,
        },
      },
    });

    await createNotification(
      {
        userId: payload.inviteeId,
        actorId: ownerId,
        type: NotificationType.CollectionInvite,
        entityType: 'collection_invite',
        entityId: invite.id,
        referenceId: invite.id,
        dedupeKey: notificationDedupeKeys.collectionInvite(invite.id),
        metadata: {
          collectionId,
          collectionName: collection.name,
          role: payload.role,
          status: 'pending',
        },
      },
      tx,
    );

    return {
      ...invite,
      role: roleToApi(invite.role),
    };
  });
}

export async function listCollectionInvites(ownerId: string, collectionId: string) {
  await requireCollectionOwner(ownerId, collectionId);

  const invites = await prisma.collectionInvite.findMany({
    where: {
      collectionId,
      status: CollectionInviteStatus.PENDING,
    },
    include: {
      invitee: {
        select: selectUserSummary,
      },
      inviter: {
        select: selectUserSummary,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return invites.map((invite) => ({
    ...invite,
    role: roleToApi(invite.role),
    status: invite.status.toLowerCase(),
  }));
}

export async function revokeCollectionInvite(ownerId: string, collectionId: string, inviteId: string) {
  await requireCollectionOwner(ownerId, collectionId);

  const invite = await prisma.collectionInvite.findFirst({
    where: {
      id: inviteId,
      collectionId,
      status: CollectionInviteStatus.PENDING,
    },
  });

  if (!invite) {
    throw notFound('Invitation not found');
  }

  return prisma.$transaction(async (tx) => {
    const revokedInvite = await tx.collectionInvite.update({
      where: { id: invite.id },
      data: {
        status: CollectionInviteStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    await resolveNotificationsByEntity('collection_invite', invite.id, tx);

    return {
      ...revokedInvite,
      role: roleToApi(revokedInvite.role),
      status: revokedInvite.status.toLowerCase(),
    };
  });
}

export async function updateCollectionMember(
  ownerId: string,
  collectionId: string,
  memberId: string,
  payload: UpdateCollectionMemberPayload,
) {
  await requireCollectionOwner(ownerId, collectionId);

  const member = await prisma.collectionMember.findFirst({
    where: {
      id: memberId,
      collectionId,
    },
  });

  if (!member) {
    throw notFound('Member not found');
  }

  const updatedMember = await prisma.collectionMember.update({
    where: { id: member.id },
    data: {
      role: roleFromApi(payload.role),
    },
    include: {
      user: {
        select: selectUserSummary,
      },
    },
  });

  return {
    ...updatedMember,
    role: roleToApi(updatedMember.role),
  };
}

export async function removeCollectionMember(ownerId: string, collectionId: string, memberId: string) {
  await requireCollectionOwner(ownerId, collectionId);

  const member = await prisma.collectionMember.findFirst({
    where: {
      id: memberId,
      collectionId,
    },
  });

  if (!member) {
    throw notFound('Member not found');
  }

  await prisma.collectionMember.delete({
    where: {
      id: member.id,
    },
  });

  return member;
}

export async function leaveSharedCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!collection) {
    throw notFound('Collection not found');
  }

  if (collection.userId === userId) {
    throw badRequest('Owners cannot leave their own collection');
  }

  const member = await prisma.collectionMember.findUnique({
    where: {
      collectionId_userId: {
        collectionId,
        userId,
      },
    },
  });

  if (!member) {
    throw notFound('Membership not found');
  }

  await prisma.collectionMember.delete({
    where: {
      id: member.id,
    },
  });

  return member;
}

export async function respondToCollectionInvite(userId: string, inviteId: string, payload: RespondToCollectionInvitePayload) {
  const invite = await prisma.collectionInvite.findUnique({
    where: { id: inviteId },
    include: {
      collection: true,
    },
  });

  if (!invite || invite.inviteeId !== userId) {
    throw notFound('Invitation not found');
  }

  if (invite.status !== CollectionInviteStatus.PENDING) {
    throw badRequest('Invitation is no longer available');
  }

  const status =
    payload.action === 'accept' ? CollectionInviteStatus.ACCEPTED : CollectionInviteStatus.REJECTED;

  return prisma.$transaction(async (tx) => {
    const updatedInvite = await tx.collectionInvite.update({
      where: { id: invite.id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    if (payload.action === 'accept') {
      await tx.collectionMember.upsert({
        where: {
          collectionId_userId: {
            collectionId: invite.collectionId,
            userId,
          },
        },
        create: {
          collectionId: invite.collectionId,
          userId,
          role: invite.role,
        },
        update: {
          role: invite.role,
        },
      });
    }

    await resolveNotificationsByEntity('collection_invite', invite.id, tx);

    return {
      ...updatedInvite,
      role: roleToApi(updatedInvite.role),
    };
  });
}
