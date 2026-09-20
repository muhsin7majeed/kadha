import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { promoteTestUserToAdmin } from './helpers/admin';
import { authorization, registerTestUser } from './helpers/auth';
import { createTestCollection } from './helpers/collection';
import { updateUserMediaFlag } from './helpers/user-media';

describe('admin routes', () => {
  it('rejects unauthenticated admin requests', async () => {
    const response = await request(await getTestApp()).get('/api/admin/overview').expect(401);

    expect(response.body).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  });

  it('rejects non-admin users', async () => {
    const user = await registerTestUser('normal-admin-viewer');

    const response = await request(await getTestApp())
      .get('/api/admin/overview')
      .set('Authorization', authorization(user))
      .expect(403);

    expect(response.body).toEqual({
      code: 'FORBIDDEN',
      message: 'Forbidden',
    });
  });

  it('allows admins to change user roles and records the transition', async () => {
    const admin = await registerTestUser('role-management-admin');
    const target = await registerTestUser('role-management-target');

    await promoteTestUserToAdmin(admin);

    const promoted = await request(await getTestApp())
      .patch(`/api/admin/users/${target.userId}/role`)
      .set('Authorization', authorization(admin))
      .send({ role: 'ADMIN' })
      .expect(200);

    expect(promoted.body.data).toMatchObject({ id: target.userId, username: target.username, role: 'ADMIN' });

    const activity = await prisma.userActivity.findFirst({
      where: { userId: admin.userId, type: 'ADMIN_ROLE_CHANGED' },
      orderBy: { createdAt: 'desc' },
    });
    expect(activity).toMatchObject({
      userId: admin.userId,
      metadata: JSON.stringify({
        targetUserId: target.userId,
        targetUsername: target.username,
        previousRole: 'USER',
        newRole: 'ADMIN',
      }),
    });

    const demoted = await request(await getTestApp())
      .patch(`/api/admin/users/${target.userId}/role`)
      .set('Authorization', authorization(admin))
      .send({ role: 'USER' })
      .expect(200);

    expect(demoted.body.data).toMatchObject({ id: target.userId, role: 'USER' });

    const selfDemotion = await request(await getTestApp())
      .patch(`/api/admin/users/${admin.userId}/role`)
      .set('Authorization', authorization(admin))
      .send({ role: 'USER' })
      .expect(403);

    expect(selfDemotion.body).toEqual({
      code: 'FORBIDDEN',
      message: 'You cannot change your own role',
    });
  });

  it('allows admin users to read overview metrics', async () => {
    const admin = await registerTestUser('overview-admin');
    const trackedUser = await registerTestUser('overview-user');

    await promoteTestUserToAdmin(admin);
    await updateUserMediaFlag(trackedUser, 'liked', true, 883101);
    await createTestCollection(trackedUser, 'Admin overview collection');

    const response = await request(await getTestApp())
      .get('/api/admin/overview')
      .set('Authorization', authorization(admin))
      .expect(200);

    expect(response.body.data).toMatchObject({
      totalUsers: 2,
      totalAdmins: 1,
      totalTrackedMediaRows: 1,
      totalCollections: 1,
      appName: 'Kadha',
      appVersion: expect.any(String),
    });
  });

  it('allows admin users to list and inspect users', async () => {
    const admin = await registerTestUser('users-admin');
    const trackedUser = await registerTestUser('users-tracked');

    await promoteTestUserToAdmin(admin);
    await updateUserMediaFlag(trackedUser, 'liked', true, 883201);
    await updateUserMediaFlag(trackedUser, 'watched', true, 883202);
    await updateUserMediaFlag(trackedUser, 'watchlist', true, 883203);
    await createTestCollection(trackedUser, 'Admin users collection');

    const listResponse = await request(await getTestApp())
      .get('/api/admin/users')
      .query({ query: trackedUser.username })
      .set('Authorization', authorization(admin))
      .expect(200);

    expect(listResponse.body.pagination.total).toBe(1);
    expect(listResponse.body.data[0]).toMatchObject({
      id: trackedUser.userId,
      username: trackedUser.username,
      role: 'USER',
      likedCount: 1,
      watchedCount: 1,
      watchlistCount: 1,
      collectionCount: 1,
    });

    const detailResponse = await request(await getTestApp())
      .get(`/api/admin/users/${trackedUser.userId}`)
      .set('Authorization', authorization(admin))
      .expect(200);

    expect(detailResponse.body.data).toMatchObject({
      id: trackedUser.userId,
      username: trackedUser.username,
      role: 'USER',
      likedCount: 1,
      watchedCount: 1,
      watchlistCount: 1,
      collectionCount: 1,
      pendingSentFriendRequestCount: 0,
      pendingReceivedFriendRequestCount: 0,
    });
  });
});
