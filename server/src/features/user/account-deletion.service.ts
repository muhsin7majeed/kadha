import { CollectionMemberRole, Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';

import { transferCollectionOwnership } from '@/features/collection/collection-ownership.service';
import { createNotification, resolveNotificationsByEntity } from '@/features/notification/notification.service';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@/types/common';
import { AccountDeletionOwnershipPlan, DeleteAccountResult, DeletionImpactResponse } from './account-deletion.types';

type AccountDeletionDb = typeof prisma | Prisma.TransactionClient;

class DeletionImpactChangedError extends Error {}

const roleToApi = (role: CollectionMemberRole) =>
  role === CollectionMemberRole.EDITOR ? ('editor' as const) : ('viewer' as const);

const incrementCount = (counts: Map<string, number>, id: string) => {
  counts.set(id, (counts.get(id) ?? 0) + 1);
};

export async function getDeletionImpact(
  userId: string,
  db: AccountDeletionDb = prisma,
): Promise<DeletionImpactResponse> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error('User not found while calculating deletion impact');
  }

  const [ownedCollections, membershipsToLeave, administratorCount] = await Promise.all([
    db.collection.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            createdAt: true,
            user: {
              select: { username: true },
            },
          },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { id: 'asc' },
    }),
    db.collectionMember.findMany({
      where: { userId },
      select: {
        id: true,
        collectionId: true,
        role: true,
        createdAt: true,
        collection: { select: { userId: true } },
      },
      orderBy: { id: 'asc' },
    }),
    user.role === UserRole.ADMIN ? db.user.count({ where: { role: UserRole.ADMIN } }) : Promise.resolve(0),
  ]);

  const isFinalAdministrator = user.role === UserRole.ADMIN && administratorCount === 1;
  const sharedOwnedCollections = ownedCollections
    .filter((collection) => collection.members.length > 0)
    .map((collection) => ({
      id: collection.id,
      name: collection.name,
      itemCount: collection._count.items,
      members: collection.members.map((member) => ({
        memberId: member.id,
        userId: member.userId,
        username: member.user.username,
        role: roleToApi(member.role),
        joinedAt: member.createdAt.toISOString(),
      })),
      automaticRecipientUserId: collection.members[0].userId,
    }));

  const fingerprintInput = {
    isFinalAdministrator,
    collections: ownedCollections.map((collection) => ({
      id: collection.id,
      ownerId: collection.userId,
      members: collection.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt.toISOString(),
      })),
    })),
    membershipsToLeave: membershipsToLeave.map((membership) => ({
      id: membership.id,
      collectionId: membership.collectionId,
      ownerId: membership.collection.userId,
      role: membership.role,
      createdAt: membership.createdAt.toISOString(),
    })),
  };

  return {
    impactFingerprint: createHash('sha256').update(JSON.stringify(fingerprintInput)).digest('base64url'),
    isFinalAdministrator,
    ownedCollectionCount: ownedCollections.length,
    unsharedOwnedCollectionCount: ownedCollections.length - sharedOwnedCollections.length,
    membershipsToLeaveCount: membershipsToLeave.length,
    sharedOwnedCollections,
  };
}

export async function deleteCurrentUserWithPlan(
  userId: string,
  currentPassword: string,
  impactFingerprint: string,
  ownershipPlan: AccountDeletionOwnershipPlan,
): Promise<DeleteAccountResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true, role: true },
      });

      if (!user) return 'INVALID_CURRENT_PASSWORD';

      const impact = await getDeletionImpact(user.id, tx);
      if (impact.impactFingerprint !== impactFingerprint) return 'DELETION_IMPACT_CHANGED';

      if (!(await bcrypt.compare(currentPassword, user.password))) return 'INVALID_CURRENT_PASSWORD';
      if (impact.isFinalAdministrator) return 'LAST_ADMIN';

      const ownedCollectionIds = new Set(
        await tx.collection
          .findMany({ where: { userId: user.id }, select: { id: true } })
          .then((collections) => collections.map((collection) => collection.id)),
      );
      const overrideByCollectionId = new Map(
        ownershipPlan.overrides.map((override) => [override.collectionId, override]),
      );

      if (ownershipPlan.overrides.some((override) => !ownedCollectionIds.has(override.collectionId))) {
        return 'DELETION_IMPACT_CHANGED';
      }

      const collections = await tx.collection.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          members: {
            select: { id: true, userId: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          },
          invites: {
            where: { inviterId: user.id, status: 'PENDING' },
            select: { id: true },
          },
        },
        orderBy: { id: 'asc' },
      });
      const memberships = await tx.collectionMember.findMany({
        where: { userId: user.id },
        select: { collection: { select: { userId: true } } },
      });

      const removedCollectionCounts = new Map<string, number>();
      const departedCollectionCounts = new Map<string, number>();
      const transfers: Array<{
        collectionId: string;
        collectionName: string;
        newOwnerUserId: string;
        memberUserIds: string[];
      }> = [];

      for (const membership of memberships) {
        incrementCount(departedCollectionCounts, membership.collection.userId);
      }

      for (const collection of collections) {
        const override = overrideByCollectionId.get(collection.id);
        const newOwnerUserId =
          override?.action === 'transfer'
            ? override.newOwnerUserId
            : override?.action === 'delete'
              ? null
              : ownershipPlan.automaticallyTransferEligibleCollections
                ? (collection.members[0]?.userId ?? null)
                : null;

        if (newOwnerUserId) {
          if (!collection.members.some((member) => member.userId === newOwnerUserId)) {
            throw new DeletionImpactChangedError();
          }

          transfers.push({
            collectionId: collection.id,
            collectionName: collection.name,
            newOwnerUserId,
            memberUserIds: collection.members.map((member) => member.userId),
          });
        } else {
          for (const member of collection.members) incrementCount(removedCollectionCounts, member.userId);
        }

        for (const invite of collection.invites) {
          await resolveNotificationsByEntity('collection_invite', invite.id, tx);
        }
      }

      for (const transfer of transfers) {
        const didTransfer = await transferCollectionOwnership(
          tx,
          transfer.collectionId,
          user.id,
          transfer.newOwnerUserId,
        );
        if (!didTransfer) throw new DeletionImpactChangedError();

        await createNotification(
          {
            userId: transfer.newOwnerUserId,
            type: NotificationType.CollectionOwnershipReceived,
            entityType: 'collection',
            entityId: transfer.collectionId,
            referenceId: transfer.collectionId,
            metadata: { collectionName: transfer.collectionName },
          },
          tx,
        );

        for (const memberUserId of transfer.memberUserIds) {
          if (memberUserId === transfer.newOwnerUserId) continue;
          await createNotification(
            {
              userId: memberUserId,
              type: NotificationType.CollectionOwnershipChanged,
              entityType: 'collection',
              entityId: transfer.collectionId,
              referenceId: transfer.collectionId,
              metadata: { collectionName: transfer.collectionName },
            },
            tx,
          );
        }
      }

      for (const [recipientId, count] of removedCollectionCounts) {
        await createNotification(
          {
            userId: recipientId,
            type: NotificationType.SharedCollectionsRemoved,
            metadata: { count },
          },
          tx,
        );
      }

      for (const [ownerId, count] of departedCollectionCounts) {
        await createNotification(
          {
            userId: ownerId,
            type: NotificationType.CollectionCollaboratorDeparted,
            metadata: { count },
          },
          tx,
        );
      }

      await tx.notification.deleteMany({ where: { actorId: user.id } });
      const deleteResult = await tx.user.deleteMany({
        where: { id: user.id, password: user.password },
      });

      if (deleteResult.count !== 1) throw new DeletionImpactChangedError();
      return 'DELETED';
    });
  } catch (error) {
    if (error instanceof DeletionImpactChangedError) return 'DELETION_IMPACT_CHANGED';
    throw error;
  }
}
