import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { getTestApp } from './helpers/app';
import { registerTestUser } from './helpers/auth';

describe('auth edge cases', () => {
  it('rejects duplicate usernames during registration', async () => {
    await registerTestUser('duplicate-auth-user');

    const response = await request(await getTestApp())
      .post('/api/auth/register')
      .send({
        username: 'duplicate-auth-user',
        password: 'password123',
        watchRegion: 'US',
      })
      .expect(400);

    expect(response.body).toEqual({
      code: 'BAD_REQUEST',
      message: 'Validation failed',
      fieldErrors: {
        username: 'Username already exists',
      },
    });
  });

  it('rejects invalid login credentials', async () => {
    await registerTestUser('invalid-login-user');

    const response = await request(await getTestApp())
      .post('/api/auth/login')
      .send({
        username: 'invalid-login-user',
        password: 'wrong-password',
      })
      .expect(400);

    expect(response.body).toEqual({
      code: 'BAD_REQUEST',
      message: 'Invalid username or password',
    });
  });

  it('refreshes access tokens from refresh cookies and logs out', async () => {
    await registerTestUser('refresh-login-user');

    const loginResponse = await request(await getTestApp())
      .post('/api/auth/login')
      .send({
        username: 'refresh-login-user',
        password: 'password123',
      })
      .expect(200);

    const refreshToken = loginResponse.body.refreshToken as string;

    const refreshResponse = await request(await getTestApp())
      .post('/api/auth/refresh')
      .set('Cookie', [`jwt=${refreshToken}`])
      .expect(200);

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    });

    const logoutResponse = await request(await getTestApp())
      .post('/api/auth/logout')
      .set('Cookie', [`jwt=${refreshToken}`])
      .expect(200);

    expect(logoutResponse.body).toEqual({
      message: 'User logged out successfully',
    });
    expect(logoutResponse.headers['set-cookie']?.[0]).toContain('jwt=');
  });

  it('rejects refresh requests without a refresh cookie', async () => {
    const response = await request(await getTestApp()).post('/api/auth/refresh').expect(401);

    expect(response.body).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  });
});
