import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { createTestCollection, inviteUserToCollection } from './helpers/collection';

const getNotifications = async (user: Awaited<ReturnType<typeof registerTestUser>>) => {
  const response = await request(await getTestApp())
    .get('/api/notifications')
    .set('Authorization', authorization(user))
    .expect(200);

  return response.body as {
    data: Array<{ id: string; type: string; read: boolean; actor?: { id: string; username: string } }>;
    pagination: { total: number };
  };
};

describe('notification routes', () => {
  it('lists unread notifications and marks one as read', async () => {
    const sender = await registerTestUser('notification-sender');
    const receiver = await registerTestUser('notification-receiver');

    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: receiver.userId })
      .expect(201);

    const unreadResponse = await request(await getTestApp())
      .get('/api/notifications/unread-count')
      .set('Authorization', authorization(receiver))
      .expect(200);

    expect(unreadResponse.body).toEqual({
      data: {
        count: 1,
      },
    });

    const notifications = await getNotifications(receiver);

    expect(notifications.pagination.total).toBe(1);
    expect(notifications.data[0]).toMatchObject({
      type: 'FRIEND_REQUEST_RECEIVED',
      read: false,
      actor: {
        id: sender.userId,
        username: sender.username,
      },
    });

    const readResponse = await request(await getTestApp())
      .patch(`/api/notifications/${notifications.data[0].id}/read`)
      .set('Authorization', authorization(receiver))
      .expect(200);

    expect(readResponse.body).toEqual({
      message: 'Notification marked as read',
    });

    const updatedUnreadResponse = await request(await getTestApp())
      .get('/api/notifications/unread-count')
      .set('Authorization', authorization(receiver))
      .expect(200);

    expect(updatedUnreadResponse.body.data.count).toBe(0);
  });

  it('marks all unresolved notifications as read', async () => {
    const sender = await registerTestUser('mark-all-sender');
    const owner = await registerTestUser('mark-all-owner');
    const receiver = await registerTestUser('mark-all-receiver');
    const collection = await createTestCollection(owner, 'Notification collection');

    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: receiver.userId })
      .expect(201);
    await inviteUserToCollection(owner, collection.id, receiver, 'viewer');

    const markAllResponse = await request(await getTestApp())
      .patch('/api/notifications/read-all')
      .set('Authorization', authorization(receiver))
      .expect(200);

    expect(markAllResponse.body).toEqual({
      data: {
        count: 2,
      },
    });

    const unreadResponse = await request(await getTestApp())
      .get('/api/notifications/unread-count')
      .set('Authorization', authorization(receiver))
      .expect(200);

    expect(unreadResponse.body.data.count).toBe(0);
  });

  it('does not let users mark another user notification as read', async () => {
    const sender = await registerTestUser('notification-owner-sender');
    const receiver = await registerTestUser('notification-owner-receiver');
    const outsider = await registerTestUser('notification-outsider');

    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: receiver.userId })
      .expect(201);

    const notifications = await getNotifications(receiver);

    const response = await request(await getTestApp())
      .patch(`/api/notifications/${notifications.data[0].id}/read`)
      .set('Authorization', authorization(outsider))
      .expect(404);

    expect(response.body).toEqual({
      code: 'NOT_FOUND',
      message: 'Notification not found',
    });
  });

  it('resolves friend request notifications when accepted', async () => {
    const sender = await registerTestUser('resolved-sender');
    const receiver = await registerTestUser('resolved-receiver');

    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: receiver.userId })
      .expect(201);

    await request(await getTestApp())
      .post('/api/friendship/accept-friend-request')
      .set('Authorization', authorization(receiver))
      .send({ senderId: sender.userId })
      .expect(200);

    const receiverNotifications = await getNotifications(receiver);
    const senderNotifications = await getNotifications(sender);

    expect(receiverNotifications.pagination.total).toBe(0);
    expect(receiverNotifications.data).toEqual([]);
    expect(senderNotifications.pagination.total).toBe(1);
    expect(senderNotifications.data[0]).toMatchObject({
      type: 'FRIEND_REQUEST_ACCEPTED',
      read: false,
      actor: {
        id: receiver.userId,
        username: receiver.username,
      },
    });
  });
});
