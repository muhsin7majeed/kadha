import { UserActivityType } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createUserActivity } from '@/features/activity/activity.service';
import { envConfig } from '@/config/env';
import { DEFAULT_WATCH_REGION, normalizeWatchRegion } from '@/constants/watch-regions';
import { prisma } from '@/lib/prisma';
import { ACCESS_TOKEN_EXPIRATION_SECONDS, REFRESH_TOKEN_EXPIRATION_SECONDS } from './auth.constants';
import { LoginBody, RegisterBody } from './auth.schema';

interface RefreshTokenPayload {
  username: string;
  userId: string;
}

export function getTokens(username: string, userId: string) {
  const accessToken = jwt.sign({ username, userId }, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
  });
  const refreshToken = jwt.sign({ username, userId }, envConfig.jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_SECONDS,
  });

  return { accessToken, refreshToken };
}

export async function registerUser({ username, password, watchRegion }: RegisterBody) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (user) {
    return { fieldErrors: { username: 'Username already exists' } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        username,
        password: hashedPassword,
        watchRegion: normalizeWatchRegion(watchRegion ?? DEFAULT_WATCH_REGION),
      },
    });

    await createUserActivity(
      {
        userId: createdUser.id,
        type: UserActivityType.ACCOUNT_CREATED,
        metadata: {
          title: createdUser.username,
        },
      },
      tx,
    );

    return createdUser;
  });

  return {
    ...getTokens(newUser.username, newUser.id),
    userId: newUser.id,
  };
}

export async function loginUser({ username, password }: LoginBody) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  await createUserActivity({
    userId: user.id,
    type: UserActivityType.ACCOUNT_LOGGED_IN,
    metadata: {
      title: user.username,
    },
  });

  return {
    ...getTokens(user.username, user.id),
    userId: user.id,
  };
}

export function refreshAccessToken(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, envConfig.jwtRefreshSecret) as RefreshTokenPayload;

  return jwt.sign({ username: decoded.username, userId: decoded.userId }, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
  });
}

export async function recordLogoutActivity(refreshToken?: string) {
  if (!refreshToken) {
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, envConfig.jwtRefreshSecret) as RefreshTokenPayload;

    await createUserActivity({
      userId: decoded.userId,
      type: UserActivityType.ACCOUNT_LOGGED_OUT,
      metadata: {
        title: decoded.username,
      },
    });
  } catch {
    return;
  }
}
