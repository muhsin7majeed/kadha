import request from 'supertest';

import { getTestApp } from './app';
import { authorization, TestUser } from './auth';

export const createAcceptedFriendship = async (sender: TestUser, receiver: TestUser) => {
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
};
