import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { REFRESH_TOKEN_EXPIRATION_SECONDS } from '@/features/auth/auth.constants';
import { getTestApp } from './helpers/app';
import { getRefreshCookie, getRefreshToken, registerTestUser } from './helpers/auth';

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

    const refreshCookie = getRefreshCookie(loginResponse);
    const refreshToken = getRefreshToken(loginResponse);
    const refreshTokenPayload = jwt.decode(refreshToken);

    expect(loginResponse.body).not.toHaveProperty('refreshToken');
    expect(refreshCookie).toContain(`Max-Age=${REFRESH_TOKEN_EXPIRATION_SECONDS}`);
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Secure');
    expect(refreshCookie).toContain('SameSite=None');

    if (
      !refreshTokenPayload ||
      typeof refreshTokenPayload === 'string' ||
      typeof refreshTokenPayload.iat !== 'number' ||
      typeof refreshTokenPayload.exp !== 'number'
    ) {
      throw new Error('Expected refresh token timestamps');
    }

    expect(refreshTokenPayload.exp - refreshTokenPayload.iat).toBe(REFRESH_TOKEN_EXPIRATION_SECONDS);

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
