import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { REFRESH_TOKEN_EXPIRATION_SECONDS } from '@/features/auth/auth.constants';
import { hashRecoveryCode, normalizeRecoveryCode } from '@/features/auth/recovery-code';
import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, getRefreshCookie, getRefreshToken, registerTestUser } from './helpers/auth';

describe('auth edge cases', () => {
  it('allows JSON authentication requests from the configured client origin', async () => {
    await registerTestUser('allowed-origin-user');

    await request(await getTestApp())
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({
        username: 'allowed-origin-user',
        password: 'password123',
      })
      .expect(200);
  });

  it('rejects authentication requests from another origin', async () => {
    const response = await request(await getTestApp())
      .post('/api/auth/login')
      .set('Origin', 'https://malicious.example')
      .send({
        username: 'origin-rejected-user',
        password: 'password123',
      })
      .expect(403);

    expect(response.body).toEqual({
      code: 'FORBIDDEN',
      message: 'Request origin is not allowed',
    });
  });

  it('rejects cross-site browser authentication requests without an Origin header', async () => {
    const response = await request(await getTestApp())
      .post('/api/auth/refresh')
      .set('Sec-Fetch-Site', 'cross-site')
      .send({})
      .expect(403);

    expect(response.body).toEqual({
      code: 'FORBIDDEN',
      message: 'Cross-site authentication requests are not allowed',
    });
  });

  it('requires JSON for state-changing authentication requests', async () => {
    const response = await request(await getTestApp())
      .post('/api/auth/login')
      .type('form')
      .send({ username: 'form-user', password: 'password123' })
      .expect(415);

    expect(response.body).toEqual({
      code: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Authentication requests require application/json',
    });
  });

  it('requires at least eight characters for new passwords', async () => {
    const response = await request(await getTestApp())
      .post('/api/auth/register')
      .send({
        username: 'short-password-user',
        password: 'short7!',
        watchRegion: 'US',
      })
      .expect(400);

    expect(response.body).toEqual({
      code: 'BAD_REQUEST',
      message: 'Validation failed',
      fieldErrors: {
        password: 'Password must be at least 8 characters long',
      },
    });
  });

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

  it('issues a recovery code during registration and stores only its hash', async () => {
    const user = await registerTestUser('registration-recovery-user');
    const normalizedCode = normalizeRecoveryCode(user.recoveryCode);
    const storedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
      select: {
        profilePrivacy: true,
        watchedPrivacy: true,
        likedPrivacy: true,
        watchlistPrivacy: true,
        recoveryCodeHash: true,
        recoveryCodeIssuedAt: true,
      },
    });

    expect(user.recoveryCode).toMatch(/^KADHA-(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
    expect(normalizedCode).not.toBeNull();
    expect(storedUser.recoveryCodeHash).toBe(hashRecoveryCode(normalizedCode!));
    expect(storedUser.recoveryCodeHash).not.toContain(user.recoveryCode);
    expect(storedUser.recoveryCodeIssuedAt).toBeInstanceOf(Date);
    expect(storedUser).toMatchObject({
      profilePrivacy: 'ONLY_ME',
      watchedPrivacy: 'ONLY_ME',
      likedPrivacy: 'ONLY_ME',
      watchlistPrivacy: 'ONLY_ME',
    });

    const statusResponse = await request(await getTestApp())
      .get('/api/auth/recovery-code/status')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(statusResponse.body).toEqual({
      configured: true,
      createdAt: expect.any(String),
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

  it('rate-limits repeated failed logins for one account', async () => {
    const user = await registerTestUser('rate-limited-login-user');
    const app = await getTestApp();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: user.username, password: 'wrong-password' })
        .expect(400);
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username.toUpperCase(), password: 'password123' })
      .expect(429);

    expect(response.body).toEqual({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Try again later.',
    });
    expect(response.headers['retry-after']).toBeDefined();
  });

  it('rate-limits repeated registration requests from one IP address', async () => {
    const app = await getTestApp();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(app).post('/api/auth/register').send({ username: '', password: '', watchRegion: 'US' }).expect(400);
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'blocked-registration',
        password: 'password123',
        watchRegion: 'US',
      })
      .expect(429);

    expect(response.body).toEqual({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many registration attempts. Try again later.',
    });
    expect(response.headers['retry-after']).toBeDefined();
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
    expect(refreshCookie).toContain('SameSite=Strict');

    if (
      !refreshTokenPayload ||
      typeof refreshTokenPayload === 'string' ||
      typeof refreshTokenPayload.iat !== 'number' ||
      typeof refreshTokenPayload.exp !== 'number'
    ) {
      throw new Error('Expected refresh token timestamps');
    }

    expect(refreshTokenPayload.exp - refreshTokenPayload.iat).toBe(REFRESH_TOKEN_EXPIRATION_SECONDS);
    expect(refreshTokenPayload.sessionVersion).toBe(0);

    const refreshResponse = await request(await getTestApp())
      .post('/api/auth/refresh')
      .set('Cookie', [`jwt=${refreshToken}`])
      .send({})
      .expect(200);

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    });

    const logoutResponse = await request(await getTestApp())
      .post('/api/auth/logout')
      .set('Cookie', [`jwt=${refreshToken}`])
      .send({})
      .expect(200);

    expect(logoutResponse.body).toEqual({
      message: 'User logged out successfully',
    });
    expect(logoutResponse.headers['set-cookie']?.[0]).toContain('jwt=');
  });

  it('rejects refresh requests without a refresh cookie', async () => {
    const response = await request(await getTestApp())
      .post('/api/auth/refresh')
      .send({})
      .expect(401);

    expect(response.body).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  });

  it('rate-limits repeated session refresh requests from one IP address', async () => {
    const app = await getTestApp();

    for (let attempt = 0; attempt < 120; attempt += 1) {
      await request(app).post('/api/auth/refresh').send({}).expect(401);
    }

    const response = await request(app).post('/api/auth/refresh').send({}).expect(429);

    expect(response.body).toEqual({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many session refresh attempts. Try again later.',
    });
    expect(response.headers['retry-after']).toBeDefined();
  });

  it('lets existing users create a first recovery code after reauthentication', async () => {
    const user = await registerTestUser('existing-recovery-user');

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        recoveryCodeHash: null,
        recoveryCodeIssuedAt: null,
      },
    });

    const statusBefore = await request(await getTestApp())
      .get('/api/auth/recovery-code/status')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(statusBefore.body).toEqual({
      configured: false,
      createdAt: null,
    });

    await request(await getTestApp())
      .post('/api/auth/recovery-code')
      .set('Authorization', authorization(user))
      .send({ currentPassword: 'wrong-password' })
      .expect(400, {
        code: 'BAD_REQUEST',
        message: 'Invalid password',
      });

    const createResponse = await request(await getTestApp())
      .post('/api/auth/recovery-code')
      .set('Authorization', authorization(user))
      .send({ currentPassword: 'password123' })
      .expect(200);

    expect(createResponse.body).toEqual({
      recoveryCode: expect.stringMatching(/^KADHA-/),
      createdAt: expect.any(String),
    });

    const activity = await prisma.userActivity.findFirstOrThrow({
      where: {
        userId: user.userId,
        type: 'RECOVERY_CODE_CREATED',
      },
    });

    expect(activity.metadata).not.toContain(createResponse.body.recoveryCode);
  });

  it('replaces a configured recovery code and immediately invalidates the old code', async () => {
    const user = await registerTestUser('replace-recovery-user');

    const replaceResponse = await request(await getTestApp())
      .post('/api/auth/recovery-code')
      .set('Authorization', authorization(user))
      .send({ currentPassword: 'password123' })
      .expect(200);

    expect(replaceResponse.body.recoveryCode).not.toBe(user.recoveryCode);

    await request(await getTestApp())
      .post('/api/auth/recover')
      .send({
        username: user.username,
        recoveryCode: user.recoveryCode,
        newPassword: 'replacement-password',
      })
      .expect(400, {
        code: 'BAD_REQUEST',
        message: 'Invalid username or recovery code',
      });

    await request(await getTestApp())
      .post('/api/auth/recover')
      .send({
        username: user.username,
        recoveryCode: replaceResponse.body.recoveryCode,
        newPassword: 'replacement-password',
      })
      .expect(200);
  });

  it('resets a password, rotates the recovery code, and revokes previous sessions', async () => {
    const user = await registerTestUser('recover-account-user');

    const response = await request(await getTestApp())
      .post('/api/auth/recover')
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send({
        username: user.username,
        recoveryCode: user.recoveryCode.toLowerCase().replaceAll('-', ' '),
        newPassword: 'new-password-123',
      })
      .expect(200);

    expect(response.body).toEqual({
      message: 'Password reset successfully',
      recoveryCode: expect.stringMatching(/^KADHA-/),
    });
    expect(response.body).not.toHaveProperty('accessToken');
    expect(response.headers['set-cookie']?.[0]).toContain('jwt=');

    await request(await getTestApp())
      .get('/api/user/me')
      .set('Authorization', authorization(user))
      .expect(401);

    await request(await getTestApp())
      .post('/api/auth/refresh')
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send({})
      .expect(401);

    await request(await getTestApp())
      .post('/api/auth/login')
      .send({
        username: user.username,
        password: 'password123',
      })
      .expect(400);

    await request(await getTestApp())
      .post('/api/auth/login')
      .send({
        username: user.username,
        password: 'new-password-123',
      })
      .expect(200);

    await request(await getTestApp())
      .post('/api/auth/recover')
      .send({
        username: user.username,
        recoveryCode: user.recoveryCode,
        newPassword: 'another-password-123',
      })
      .expect(400);

    const storedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
      select: { sessionVersion: true },
    });
    const activity = await prisma.userActivity.findFirstOrThrow({
      where: {
        userId: user.userId,
        type: 'PASSWORD_RESET_WITH_RECOVERY_CODE',
      },
    });

    expect(storedUser.sessionVersion).toBe(1);
    expect(activity.metadata).not.toContain(user.recoveryCode);
    expect(activity.metadata).not.toContain('new-password-123');
  });

  it('returns the same recovery error for unknown, unconfigured, and incorrect credentials', async () => {
    const user = await registerTestUser('generic-recovery-user');
    const expectedError = {
      code: 'BAD_REQUEST',
      message: 'Invalid username or recovery code',
    };

    const unknownResponse = await request(await getTestApp())
      .post('/api/auth/recover')
      .send({
        username: 'missing-recovery-user',
        recoveryCode: user.recoveryCode,
        newPassword: 'new-password-123',
      })
      .expect(400);

    const incorrectResponse = await request(await getTestApp())
      .post('/api/auth/recover')
      .send({
        username: user.username,
        recoveryCode: 'KADHA-0000-0000-0000-0000-0000-0000-0000-0000',
        newPassword: 'new-password-123',
      })
      .expect(400);

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        recoveryCodeHash: null,
        recoveryCodeIssuedAt: null,
      },
    });

    const unconfiguredResponse = await request(await getTestApp())
      .post('/api/auth/recover')
      .send({
        username: user.username,
        recoveryCode: user.recoveryCode,
        newPassword: 'new-password-123',
      })
      .expect(400);

    expect(unknownResponse.body).toEqual(expectedError);
    expect(incorrectResponse.body).toEqual(expectedError);
    expect(unconfiguredResponse.body).toEqual(expectedError);
  });

  it('allows at most one concurrent recovery with the same code', async () => {
    const user = await registerTestUser('concurrent-recovery-user');
    const app = await getTestApp();

    const responses = await Promise.all([
      request(app).post('/api/auth/recover').send({
        username: user.username,
        recoveryCode: user.recoveryCode,
        newPassword: 'concurrent-password-one',
      }),
      request(app).post('/api/auth/recover').send({
        username: user.username,
        recoveryCode: user.recoveryCode,
        newPassword: 'concurrent-password-two',
      }),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 400]);
  });

  it('rate-limits repeated recovery attempts for one account', async () => {
    const username = 'rate-limited-recovery-user';
    const app = await getTestApp();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app)
        .post('/api/auth/recover')
        .send({
          username,
          recoveryCode: 'KADHA-0000-0000-0000-0000-0000-0000-0000-0000',
          newPassword: 'new-password-123',
        })
        .expect(400);
    }

    const response = await request(app)
      .post('/api/auth/recover')
      .send({
        username,
        recoveryCode: 'KADHA-0000-0000-0000-0000-0000-0000-0000-0000',
        newPassword: 'new-password-123',
      })
      .expect(429);

    expect(response.body).toEqual({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many recovery attempts. Try again later.',
    });
    expect(response.headers['retry-after']).toBeDefined();
  });
});
