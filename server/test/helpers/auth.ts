import request from 'supertest';

import { getTestApp } from './app';

interface AuthResponseBody {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface TestUser {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
}

let userCounter = 0;

export const registerTestUser = async (username = `test-user-${++userCounter}`): Promise<TestUser> => {
  const response = await request(await getTestApp())
    .post('/api/auth/register')
    .send({
      username,
      password: 'password123',
      watchRegion: 'US',
    })
    .expect(200);

  const body = response.body as AuthResponseBody;

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    userId: body.userId,
    username,
  };
};

export const authorization = (user: TestUser) => `Bearer ${user.accessToken}`;
