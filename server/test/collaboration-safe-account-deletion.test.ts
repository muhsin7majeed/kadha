import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { authorization, registerTestUser, TestUser } from './helpers/auth';
import {
  acceptCollectionInvite,
  addMovieToCollection,
  createTestCollection,
  inviteUserToCollection,
} from './helpers/collection';
import { getTestApp } from './helpers/app';

const confirmation = 'I understand this account cannot be recovered';

const getImpact = async (user: TestUser) => {
  const response = await request(await getTestApp())
    .get('/api/user/deletion-impact')
    .set('Authorization', authorization(user))
    .expect(200);

  return response.body.data as {
    impactFingerprint: string;
    isFinalAdministrator: boolean;
    ownedCollectionCount: number;
    unsharedOwnedCollectionCount: number;
    membershipsToLeaveCount: number;
    sharedOwnedCollections: Array<{
      id: string;
      name: string;
      itemCount: number;
      automaticRecipientUserId: string;
      members: Array<{
        memberId: string;
        userId: string;
        role: string;
        joinedAt: string;
      }>;
    }>;
  };
};

const deleteAccount = async (
  user: TestUser,
  impactFingerprint: string,
  ownershipPlan: {
    automaticallyTransferEligibleCollections: boolean;
    overrides: Array<
      { collectionId: string; action: 'delete' } | { collectionId: string; action: 'transfer'; newOwnerUserId: string }
    >;
  },
) =>
  request(await getTestApp())
    .delete('/api/user/me')
    .set('Authorization', authorization(user))
    .send({
      currentPassword: 'password123',
      confirmation,
      impactFingerprint,
      ownershipPlan,
    });

describe('collaboration-safe account deletion', () => {
  it('previews accepted collaborators and chooses the earliest member deterministically', async () => {
    const owner = await registerTestUser('impact-owner');
    const firstMember = await registerTestUser('impact-first-member');
    const secondMember = await registerTestUser('impact-second-member');
    const pendingInvitee = await registerTestUser('impact-pending-invitee');
    const shared = await createTestCollection(owner, 'Shared impact collection');
    await createTestCollection(owner, 'Private impact collection');
    const firstInvite = await inviteUserToCollection(owner, shared.id, firstMember, 'viewer');
    const secondInvite = await inviteUserToCollection(owner, shared.id, secondMember, 'editor');
    await acceptCollectionInvite(firstMember, firstInvite.id);
    await acceptCollectionInvite(secondMember, secondInvite.id);
    await inviteUserToCollection(owner, shared.id, pendingInvitee, 'viewer');

    const members = await prisma.collectionMember.findMany({
      where: { collectionId: shared.id },
      orderBy: { id: 'asc' },
    });
    const tiedCreatedAt = new Date('2026-01-01T00:00:00.000Z');
    await prisma.collectionMember.updateMany({
      where: { collectionId: shared.id },
      data: { createdAt: tiedCreatedAt },
    });

    const impact = await getImpact(owner);

    expect(impact).toMatchObject({
      isFinalAdministrator: false,
      ownedCollectionCount: 2,
      unsharedOwnedCollectionCount: 1,
      membershipsToLeaveCount: 0,
    });
    expect(impact.sharedOwnedCollections).toHaveLength(1);
    expect(impact.sharedOwnedCollections[0]).toMatchObject({
      id: shared.id,
      automaticRecipientUserId: members[0].userId,
    });
    expect(impact.sharedOwnedCollections[0].members.map((member) => member.userId)).not.toContain(
      pendingInvitee.userId,
    );
  });

  it('atomically transfers selected collections, deletes the rest, and creates anonymous notifications', async () => {
    const owner = await registerTestUser('transfer-owner');
    const firstMember = await registerTestUser('transfer-first-member');
    const secondMember = await registerTestUser('transfer-second-member');
    const removedMember = await registerTestUser('transfer-removed-member');
    const automaticCollection = await createTestCollection(owner, 'Automatic survivor');
    const explicitCollection = await createTestCollection(owner, 'Explicit survivor');
    const deletedCollection = await createTestCollection(owner, 'Private deleted name');
    await createTestCollection(owner, 'Unshared deletion');

    for (const collection of [automaticCollection, explicitCollection]) {
      const firstInvite = await inviteUserToCollection(owner, collection.id, firstMember, 'viewer');
      const secondInvite = await inviteUserToCollection(owner, collection.id, secondMember, 'editor');
      await acceptCollectionInvite(firstMember, firstInvite.id);
      await acceptCollectionInvite(secondMember, secondInvite.id);
    }
    const removedInvite = await inviteUserToCollection(owner, deletedCollection.id, removedMember, 'viewer');
    await acceptCollectionInvite(removedMember, removedInvite.id);
    await addMovieToCollection(owner, automaticCollection.id, 998001);

    const impact = await getImpact(owner);
    const response = await deleteAccount(owner, impact.impactFingerprint, {
      automaticallyTransferEligibleCollections: true,
      overrides: [
        {
          collectionId: explicitCollection.id,
          action: 'transfer',
          newOwnerUserId: secondMember.userId,
        },
        { collectionId: deletedCollection.id, action: 'delete' },
      ],
    });

    expect(response.status).toBe(200);
    expect(await prisma.user.findUnique({ where: { id: owner.userId } })).toBeNull();

    const survivingAutomatic = await prisma.collection.findUniqueOrThrow({
      where: { id: automaticCollection.id },
    });
    expect(survivingAutomatic.userId).toBe(
      impact.sharedOwnedCollections.find((item) => item.id === automaticCollection.id)?.automaticRecipientUserId,
    );
    const survivingExplicit = await prisma.collection.findUniqueOrThrow({
      where: { id: explicitCollection.id },
    });
    expect(survivingExplicit.userId).toBe(secondMember.userId);
    expect(
      await prisma.collection.findUnique({
        where: { id: deletedCollection.id },
      }),
    ).toBeNull();
    expect(
      await prisma.collectionMember.count({
        where: {
          collectionId: explicitCollection.id,
          userId: secondMember.userId,
        },
      }),
    ).toBe(0);

    const survivingItem = await prisma.collectionItem.findFirstOrThrow({
      where: { collectionId: automaticCollection.id, media_id: 998001 },
    });
    expect(survivingItem.addedByUserId).toBeNull();

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'asc' },
    });
    const deletionNotifications = notifications.filter((notification) =>
      ['COLLECTION_OWNERSHIP_RECEIVED', 'COLLECTION_OWNERSHIP_CHANGED', 'SHARED_COLLECTIONS_REMOVED'].includes(
        notification.type,
      ),
    );
    expect(deletionNotifications.some((notification) => notification.type === 'COLLECTION_OWNERSHIP_RECEIVED')).toBe(
      true,
    );
    expect(
      deletionNotifications.some(
        (notification) =>
          notification.userId === removedMember.userId && notification.type === 'SHARED_COLLECTIONS_REMOVED',
      ),
    ).toBe(true);
    for (const notification of deletionNotifications) {
      expect(notification.actorId).toBeNull();
      expect(JSON.stringify(notification)).not.toContain(owner.userId);
      expect(JSON.stringify(notification)).not.toContain(owner.username);
      if (notification.type === 'SHARED_COLLECTIONS_REMOVED') {
        expect(JSON.stringify(notification)).not.toContain(deletedCollection.id);
        expect(JSON.stringify(notification)).not.toContain('Private deleted name');
      }
    }
  });

  it('aggregates anonymous departure notifications for surviving collection owners', async () => {
    const owner = await registerTestUser('departure-owner');
    const member = await registerTestUser('departing-member');

    for (const name of ['Departure one', 'Departure two']) {
      const collection = await createTestCollection(owner, name);
      const invite = await inviteUserToCollection(owner, collection.id, member, 'editor');
      await acceptCollectionInvite(member, invite.id);
    }

    const impact = await getImpact(member);
    const response = await deleteAccount(member, impact.impactFingerprint, {
      automaticallyTransferEligibleCollections: false,
      overrides: [],
    });

    expect(response.status).toBe(200);
    const notification = await prisma.notification.findFirstOrThrow({
      where: { userId: owner.userId, type: 'COLLECTION_COLLABORATOR_DEPARTED' },
    });
    expect(notification.actorId).toBeNull();
    expect(JSON.parse(notification.metadata ?? '{}')).toEqual({ count: 2 });
    expect(JSON.stringify(notification)).not.toContain(member.userId);
    expect(JSON.stringify(notification)).not.toContain(member.username);
  });

  it('rejects a stale impact fingerprint without changing any data', async () => {
    const owner = await registerTestUser('stale-owner');
    const member = await registerTestUser('stale-member');
    const collection = await createTestCollection(owner, 'Stale collection');
    const impact = await getImpact(owner);
    const invite = await inviteUserToCollection(owner, collection.id, member, 'viewer');
    await acceptCollectionInvite(member, invite.id);

    const response = await deleteAccount(owner, impact.impactFingerprint, {
      automaticallyTransferEligibleCollections: false,
      overrides: [],
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'DELETION_IMPACT_CHANGED' });
    expect(await prisma.user.findUnique({ where: { id: owner.userId } })).not.toBeNull();
    expect(await prisma.collection.findUnique({ where: { id: collection.id } })).not.toBeNull();
  });

  it('rolls back invitation resolution when a transfer recipient is ineligible', async () => {
    const owner = await registerTestUser('rollback-owner');
    const pendingInvitee = await registerTestUser('rollback-pending-invitee');
    const ineligibleRecipient = await registerTestUser('rollback-ineligible-recipient');
    const firstCollection = await prisma.collection.create({
      data: {
        id: '00000000-0000-4000-8000-000000000001',
        userId: owner.userId,
        name: 'Pending invitation collection',
        privacy: 'ONLY_ME',
      },
    });
    const secondCollection = await prisma.collection.create({
      data: {
        id: '00000000-0000-4000-8000-000000000002',
        userId: owner.userId,
        name: 'Invalid transfer collection',
        privacy: 'ONLY_ME',
      },
    });
    const invite = await inviteUserToCollection(owner, firstCollection.id, pendingInvitee, 'viewer');
    const impact = await getImpact(owner);

    const response = await deleteAccount(owner, impact.impactFingerprint, {
      automaticallyTransferEligibleCollections: false,
      overrides: [
        {
          collectionId: secondCollection.id,
          action: 'transfer',
          newOwnerUserId: ineligibleRecipient.userId,
        },
      ],
    });

    expect(response.status).toBe(409);
    expect(await prisma.user.findUnique({ where: { id: owner.userId } })).not.toBeNull();
    expect(
      await prisma.notification.findFirst({
        where: { entityType: 'collection_invite', entityId: invite.id, resolvedAt: null },
      }),
    ).not.toBeNull();
  });
});
