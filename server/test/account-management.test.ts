import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { promoteTestUserToAdmin } from './helpers/admin';
import { authorization, registerTestUser } from './helpers/auth';
import {
  acceptCollectionInvite,
  addMovieToCollection,
  createTestCollection,
  inviteUserToCollection,
} from './helpers/collection';
import { getTestApp } from './helpers/app';
import { updateUserMediaFlag } from './helpers/user-media';

const deletionConfirmation = 'I understand this account cannot be recovered';

const getDeletionPayload = async (
  user: Awaited<ReturnType<typeof registerTestUser>>,
  confirmation = deletionConfirmation,
) => {
  const impact = await request(await getTestApp())
    .get('/api/user/deletion-impact')
    .set('Authorization', authorization(user))
    .expect(200);

  return {
    currentPassword: 'password123',
    confirmation,
    impactFingerprint: impact.body.data.impactFingerprint as string,
    ownershipPlan: {
      automaticallyTransferEligibleCollections: false,
      overrides: [],
    },
  };
};

describe('authenticated account management', () => {
  it('changes the password, records activity, and revokes every existing session', async () => {
    const user = await registerTestUser('password-change-user');
    const app = await getTestApp();

    const response = await request(app)
      .post('/api/auth/password')
      .set('Authorization', authorization(user))
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send({
        currentPassword: 'password123',
        newPassword: 'new-password-456',
      })
      .expect(200);

    expect(response.body).toEqual({ message: 'Password changed successfully' });
    expect(response.headers['set-cookie']?.[0]).toContain('jwt=');

    await request(app).get('/api/user/me').set('Authorization', authorization(user)).expect(401);
    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send({})
      .expect(401);
    await request(app).post('/api/auth/login').send({ username: user.username, password: 'password123' }).expect(400);
    await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'new-password-456' })
      .expect(200);

    const storedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
      select: { sessionVersion: true },
    });
    const activity = await prisma.userActivity.findFirstOrThrow({
      where: { userId: user.userId, type: 'PASSWORD_CHANGED' },
    });

    expect(storedUser.sessionVersion).toBe(1);
    expect(activity.metadata).not.toContain('password123');
    expect(activity.metadata).not.toContain('new-password-456');
  });

  it('rejects an incorrect current password, password reuse, and short new passwords', async () => {
    const user = await registerTestUser('password-change-validation-user');
    const app = await getTestApp();

    const incorrectResponse = await request(app)
      .post('/api/auth/password')
      .set('Authorization', authorization(user))
      .send({
        currentPassword: 'incorrect-password',
        newPassword: 'new-password-456',
      })
      .expect(400);
    expect(incorrectResponse.body.fieldErrors).toEqual({
      currentPassword: 'Current password is incorrect',
    });

    const reusedResponse = await request(app)
      .post('/api/auth/password')
      .set('Authorization', authorization(user))
      .send({ currentPassword: 'password123', newPassword: 'password123' })
      .expect(400);
    expect(reusedResponse.body.fieldErrors).toEqual({
      newPassword: 'New password must be different',
    });

    const shortResponse = await request(app)
      .post('/api/auth/password')
      .set('Authorization', authorization(user))
      .send({ currentPassword: 'password123', newPassword: 'short' })
      .expect(400);
    expect(shortResponse.body.fieldErrors).toEqual({
      newPassword: 'Password must be at least 8 characters long',
    });
  });

  it('requires the exact irreversible-action phrase before deleting an account', async () => {
    const user = await registerTestUser('delete-confirmation-user');
    const payload = await getDeletionPayload(user, 'I understand');

    const response = await request(await getTestApp())
      .delete('/api/user/me')
      .set('Authorization', authorization(user))
      .send(payload)
      .expect(400);

    expect(response.body.fieldErrors).toEqual({
      confirmation: `Type “${deletionConfirmation}” exactly`,
    });
    await expect(prisma.user.findUnique({ where: { id: user.userId } })).resolves.not.toBeNull();
  });

  it('deletes user-owned data while preserving shared collection items without deleted-user attribution', async () => {
    const user = await registerTestUser('delete-account-user');
    const survivor = await registerTestUser('delete-account-survivor');
    const app = await getTestApp();
    const ownedCollection = await createTestCollection(user, 'Deleted owner collection');
    const sharedCollection = await createTestCollection(survivor, 'Surviving collection');
    const invite = await inviteUserToCollection(survivor, sharedCollection.id, user, 'editor');

    await acceptCollectionInvite(user, invite.id);
    await addMovieToCollection(user, sharedCollection.id, 997701);
    await updateUserMediaFlag(user, 'watched', true, 997702);
    await prisma.userEpisodeWatch.create({
      data: {
        userId: user.userId,
        media_id: 997703,
        media_type: 'tv',
        seasonNumber: 2,
        episodeNumber: 3,
      },
    });
    await request(app)
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(user))
      .send({ receiverId: survivor.userId })
      .expect(201);

    const response = await request(app)
      .delete('/api/user/me')
      .set('Authorization', authorization(user))
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send(await getDeletionPayload(user))
      .expect(200);

    expect(response.body).toEqual({ message: 'Account deleted successfully' });
    expect(response.headers['set-cookie']?.[0]).toContain('jwt=');
    await request(app).get('/api/user/me').set('Authorization', authorization(user)).expect(401);
    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send({})
      .expect(401);

    expect(await prisma.user.findUnique({ where: { id: user.userId } })).toBeNull();
    expect(await prisma.userMedia.count({ where: { userId: user.userId } })).toBe(0);
    expect(await prisma.userEpisodeWatch.count({ where: { userId: user.userId } })).toBe(0);
    expect(await prisma.userActivity.count({ where: { userId: user.userId } })).toBe(0);
    expect(
      await prisma.friendship.count({
        where: { OR: [{ senderId: user.userId }, { receiverId: user.userId }] },
      }),
    ).toBe(0);
    expect(await prisma.collection.findUnique({ where: { id: ownedCollection.id } })).toBeNull();
    expect(
      await prisma.collection.findUnique({
        where: { id: sharedCollection.id },
      }),
    ).not.toBeNull();

    const survivingItem = await prisma.collectionItem.findFirstOrThrow({
      where: { collectionId: sharedCollection.id, media_id: 997701 },
    });
    expect(survivingItem.addedByUserId).toBeNull();
    expect(await prisma.notification.count({ where: { actorId: user.userId } })).toBe(0);
    expect(
      await prisma.notification.count({
        where: {
          userId: survivor.userId,
          type: 'COLLECTION_COLLABORATOR_DEPARTED',
          actorId: null,
        },
      }),
    ).toBe(1);
  });

  it('prevents deletion of the final administrator account', async () => {
    const admin = await registerTestUser('final-admin-delete-user');
    await promoteTestUserToAdmin(admin);
    const payload = await getDeletionPayload(admin);

    const response = await request(await getTestApp())
      .delete('/api/user/me')
      .set('Authorization', authorization(admin))
      .send(payload)
      .expect(409);

    expect(response.body).toEqual({
      code: 'CONFLICT',
      message: 'Promote another administrator before deleting the final administrator account',
    });
    await expect(prisma.user.findUnique({ where: { id: admin.userId } })).resolves.not.toBeNull();
  });
});
