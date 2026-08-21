import { DataPrivacy, UserActivityType } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createUserActivity } from '@/features/activity/activity.service';
import { envConfig } from '@/config/env';
import { DEFAULT_WATCH_REGION, normalizeWatchRegion } from '@/constants/watch-regions';
import { prisma } from '@/lib/prisma';
import { ACCESS_TOKEN_EXPIRATION_SECONDS, REFRESH_TOKEN_EXPIRATION_SECONDS } from './auth.constants';
import { LoginBody, RecoverAccountBody, RegisterBody } from './auth.schema';
import { createRecoveryCode, verifyRecoveryCode } from './recovery-code';

interface RefreshTokenPayload {
  username: string;
  userId: string;
  sessionVersion?: number;
}

export function getTokens(username: string, userId: string, sessionVersion: number) {
  const payload = { username, userId, sessionVersion };
  const accessToken = jwt.sign(payload, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
  });
  const refreshToken = jwt.sign(payload, envConfig.jwtRefreshSecret, {
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
  const { recoveryCode, recoveryCodeHash } = createRecoveryCode();

  const newUser = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        username,
        password: hashedPassword,
        recoveryCodeHash,
        recoveryCodeIssuedAt: new Date(),
        profilePrivacy: DataPrivacy.ONLY_ME,
        watchedPrivacy: DataPrivacy.ONLY_ME,
        likedPrivacy: DataPrivacy.ONLY_ME,
        watchlistPrivacy: DataPrivacy.ONLY_ME,
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
    ...getTokens(newUser.username, newUser.id, newUser.sessionVersion),
    recoveryCode,
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
    ...getTokens(user.username, user.id, user.sessionVersion),
    userId: user.id,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, envConfig.jwtRefreshSecret) as RefreshTokenPayload;
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      username: true,
      sessionVersion: true,
    },
  });

  if (!user || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
    throw new Error('Refresh session is no longer valid');
  }

  return jwt.sign(
    {
      username: user.username,
      userId: user.id,
      sessionVersion: user.sessionVersion,
    },
    envConfig.jwtAccessSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
    },
  );
}

export async function recordLogoutActivity(refreshToken?: string) {
  if (!refreshToken) {
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, envConfig.jwtRefreshSecret) as RefreshTokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        sessionVersion: true,
      },
    });

    if (!user || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
      return;
    }

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

export async function getRecoveryCodeStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      recoveryCodeHash: true,
      recoveryCodeIssuedAt: true,
    },
  });

  return {
    configured: Boolean(user?.recoveryCodeHash),
    createdAt: user?.recoveryCodeIssuedAt ?? null,
  };
}

export async function createOrReplaceRecoveryCode(userId: string, currentPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      password: true,
      recoveryCodeHash: true,
    },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return null;
  }

  const { recoveryCode, recoveryCodeHash } = createRecoveryCode();
  const createdAt = new Date();
  const activityType = user.recoveryCodeHash
    ? UserActivityType.RECOVERY_CODE_REPLACED
    : UserActivityType.RECOVERY_CODE_CREATED;

  const replaced = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.user.updateMany({
      where: {
        id: user.id,
        recoveryCodeHash: user.recoveryCodeHash,
      },
      data: {
        recoveryCodeHash,
        recoveryCodeIssuedAt: createdAt,
      },
    });

    if (updateResult.count !== 1) {
      return false;
    }

    await createUserActivity(
      {
        userId: user.id,
        type: activityType,
        metadata: {
          title: user.username,
        },
      },
      tx,
    );

    return true;
  });

  if (!replaced) {
    return null;
  }

  return {
    recoveryCode,
    createdAt,
  };
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return 'INVALID_CURRENT_PASSWORD' as const;
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    return 'PASSWORD_UNCHANGED' as const;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  const changed = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.user.updateMany({
      where: {
        id: user.id,
        password: user.password,
      },
      data: {
        password: newPasswordHash,
        sessionVersion: {
          increment: 1,
        },
      },
    });

    if (updateResult.count !== 1) {
      return false;
    }

    await createUserActivity(
      {
        userId: user.id,
        type: UserActivityType.PASSWORD_CHANGED,
        metadata: {
          title: user.username,
        },
      },
      tx,
    );

    return true;
  });

  return changed ? ('CHANGED' as const) : ('INVALID_CURRENT_PASSWORD' as const);
}

export async function recoverUserAccount({ username, recoveryCode, newPassword }: RecoverAccountBody) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      recoveryCodeHash: true,
    },
  });

  if (!user?.recoveryCodeHash || !verifyRecoveryCode(recoveryCode, user.recoveryCodeHash)) {
    return null;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  const replacement = createRecoveryCode();
  const createdAt = new Date();

  const recovered = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.user.updateMany({
      where: {
        id: user.id,
        recoveryCodeHash: user.recoveryCodeHash,
      },
      data: {
        password: newPasswordHash,
        recoveryCodeHash: replacement.recoveryCodeHash,
        recoveryCodeIssuedAt: createdAt,
        sessionVersion: {
          increment: 1,
        },
      },
    });

    if (updateResult.count !== 1) {
      return false;
    }

    await createUserActivity(
      {
        userId: user.id,
        type: UserActivityType.PASSWORD_RESET_WITH_RECOVERY_CODE,
        metadata: {
          title: user.username,
        },
      },
      tx,
    );

    return true;
  });

  if (!recovered) {
    return null;
  }

  return {
    recoveryCode: replacement.recoveryCode,
  };
}
