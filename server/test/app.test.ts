import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { authorization, registerTestUser } from './helpers/auth';
import { getTestApp } from './helpers/app';

describe('app routes', () => {
  it('returns health status', async () => {
    const response = await request(await getTestApp()).get('/health').expect(200);

    expect(response.body).toMatchObject({ status: 'healthy' });
  });

  it('rejects protected routes without an access token', async () => {
    const response = await request(await getTestApp()).get('/api/user/me').expect(401);

    expect(response.body).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  });
});

describe('auth routes', () => {
  it('registers a user and returns access credentials', async () => {
    const response = await request(await getTestApp())
      .post('/api/auth/register')
      .send({
        username: 'new-user',
        password: 'password123',
        watchRegion: 'US',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'User registered successfully',
      userId: expect.any(String),
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(response.headers['set-cookie']?.[0]).toContain('jwt=');
  });

  it('lets registered users access their current profile', async () => {
    const user = await registerTestUser('profile-user');

    const response = await request(await getTestApp())
      .get('/api/user/me')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body).toMatchObject({
      id: user.userId,
      username: 'profile-user',
      watchRegion: 'US',
    });
    expect(response.body).not.toHaveProperty('password');
  });
});
