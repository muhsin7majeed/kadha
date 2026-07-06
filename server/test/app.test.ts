import type { Express } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

let app: Express;

const getApp = async () => {
  if (!app) {
    const appModule = await import('@/app');
    app = appModule.createApp();
  }

  return app;
};

describe('app routes', () => {
  it('returns health status', async () => {
    const response = await request(await getApp()).get('/health').expect(200);

    expect(response.body).toMatchObject({ status: 'healthy' });
  });

  it('rejects protected routes without an access token', async () => {
    const response = await request(await getApp()).get('/api/user/me').expect(401);

    expect(response.body).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  });
});

describe('auth routes', () => {
  it('registers a user and returns access credentials', async () => {
    const response = await request(await getApp())
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
    const registerResponse = await request(await getApp())
      .post('/api/auth/register')
      .send({
        username: 'profile-user',
        password: 'password123',
        watchRegion: 'US',
      })
      .expect(200);

    const response = await request(await getApp())
      .get('/api/user/me')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: registerResponse.body.userId,
      username: 'profile-user',
      watchRegion: 'US',
    });
    expect(response.body).not.toHaveProperty('password');
  });
});
