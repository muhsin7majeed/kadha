import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { createAcceptedFriendship } from './helpers/friendship';

describe('friendship routes', () => {
  it('sends and accepts friend requests', async () => {
    const sender = await registerTestUser('friend-request-sender');
    const receiver = await registerTestUser('friend-request-receiver');

    const sendResponse = await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: receiver.userId })
      .expect(201);

    expect(sendResponse.body).toMatchObject({
      senderId: sender.userId,
      receiverId: receiver.userId,
      status: 'PENDING',
    });

    const receivedResponse = await request(await getTestApp())
      .get('/api/friendship/friendships')
      .query({ type: 'received' })
      .set('Authorization', authorization(receiver))
      .expect(200);

    expect(receivedResponse.body.pagination.total).toBe(1);
    expect(receivedResponse.body.data[0]).toMatchObject({
      id: sender.userId,
      username: sender.username,
    });

    const acceptResponse = await request(await getTestApp())
      .post('/api/friendship/accept-friend-request')
      .set('Authorization', authorization(receiver))
      .send({ senderId: sender.userId })
      .expect(200);

    expect(acceptResponse.body).toMatchObject({
      senderId: sender.userId,
      receiverId: receiver.userId,
      status: 'ACCEPTED',
    });

    const friendsResponse = await request(await getTestApp())
      .get('/api/friendship/friendships')
      .query({ type: 'friends' })
      .set('Authorization', authorization(sender))
      .expect(200);

    expect(friendsResponse.body.pagination.total).toBe(1);
    expect(friendsResponse.body.data[0]).toMatchObject({
      id: receiver.userId,
      username: receiver.username,
    });
  });

  it('rejects friend requests and prevents later acceptance', async () => {
    const sender = await registerTestUser('reject-request-sender');
    const receiver = await registerTestUser('reject-request-receiver');

    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: receiver.userId })
      .expect(201);

    const rejectResponse = await request(await getTestApp())
      .post('/api/friendship/reject-friend-request')
      .set('Authorization', authorization(receiver))
      .send({ senderId: sender.userId })
      .expect(200);

    expect(rejectResponse.body).toMatchObject({
      senderId: sender.userId,
      receiverId: receiver.userId,
      status: 'REJECTED',
    });

    const acceptResponse = await request(await getTestApp())
      .post('/api/friendship/accept-friend-request')
      .set('Authorization', authorization(receiver))
      .send({ senderId: sender.userId })
      .expect(404);

    expect(acceptResponse.body).toEqual({
      message: 'Friend request not found',
    });
  });

  it('unfriends accepted friends', async () => {
    const firstUser = await registerTestUser('unfriend-first');
    const secondUser = await registerTestUser('unfriend-second');

    await createAcceptedFriendship(firstUser, secondUser);

    const unfriendResponse = await request(await getTestApp())
      .post('/api/friendship/unfriend')
      .set('Authorization', authorization(firstUser))
      .send({ userId: secondUser.userId })
      .expect(200);

    expect(unfriendResponse.body).toEqual({
      message: 'Friend removed successfully',
    });

    const friendsResponse = await request(await getTestApp())
      .get('/api/friendship/friendships')
      .query({ type: 'friends' })
      .set('Authorization', authorization(firstUser))
      .expect(200);

    expect(friendsResponse.body.pagination.total).toBe(0);
    expect(friendsResponse.body.data).toEqual([]);
  });

  it('blocks, prevents friend requests, and unblocks users', async () => {
    const blocker = await registerTestUser('blocker-user');
    const blocked = await registerTestUser('blocked-user');

    const blockResponse = await request(await getTestApp())
      .post('/api/friendship/block-user')
      .set('Authorization', authorization(blocker))
      .send({ userId: blocked.userId })
      .expect(200);

    expect(blockResponse.body).toMatchObject({
      senderId: blocker.userId,
      receiverId: blocked.userId,
      status: 'BLOCKED',
    });

    const sendWhileBlockedResponse = await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(blocked))
      .send({ receiverId: blocker.userId })
      .expect(403);

    expect(sendWhileBlockedResponse.body).toEqual({
      message: 'Cannot send friend request',
    });

    const blockedListResponse = await request(await getTestApp())
      .get('/api/friendship/friendships')
      .query({ type: 'blocked' })
      .set('Authorization', authorization(blocker))
      .expect(200);

    expect(blockedListResponse.body.pagination.total).toBe(1);
    expect(blockedListResponse.body.data[0]).toMatchObject({
      id: blocked.userId,
      username: blocked.username,
    });

    const unblockResponse = await request(await getTestApp())
      .post('/api/friendship/unblock-user')
      .set('Authorization', authorization(blocker))
      .send({ userId: blocked.userId })
      .expect(200);

    expect(unblockResponse.body).toEqual({
      message: 'User unblocked successfully',
    });

    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(blocked))
      .send({ receiverId: blocker.userId })
      .expect(201);
  });
});
