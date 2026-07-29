import request from 'supertest';

import { getTestApp } from './app';

interface AuthResponseBody {
  accessToken: string;
  userId: string;
}

export interface TestUser {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
}

let userCounter = 0;

export const getRefreshCookie = (response: request.Response) => {
  const refreshCookie = response.headers['set-cookie']?.find((cookie) => cookie.startsWith('jwt='));

  if (!refreshCookie) {
    throw new Error('Expected a refresh token cookie');
  }

  return refreshCookie;
};

export const getRefreshToken = (response: request.Response) => {
  const cookieValue = getRefreshCookie(response).split(';', 1)[0];
  return cookieValue.slice('jwt='.length);
};

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
    refreshToken: getRefreshToken(response),
    userId: body.userId,
    username,
  };
};

export const authorization = (user: TestUser) => `Bearer ${user.accessToken}`;
