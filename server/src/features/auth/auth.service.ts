import { createHash, randomBytes } from 'node:crypto';
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
  sessionId: string;
  tokenId: string;
  username: string;
  userId: string;
  sessionVersion?: number;
}

const hashRefreshTokenId = (tokenId: string) => createHash('sha256').update(tokenId).digest('hex');

const createAccessToken = (username: string, userId: string, sessionVersion: number) => {
  return jwt.sign({ username, userId, sessionVersion }, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
  });
};

const revokeAllRefreshSessions = async (userId: string) => {
  await prisma.refreshSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export async function getTokens(username: string, userId: string, sessionVersion: number) {
  const accessToken = createAccessToken(username, userId, sessionVersion);
  const tokenId = randomBytes(32).toString('hex');
  const refreshSession = await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: hashRefreshTokenId(tokenId),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_SECONDS * 1000),
    },
  });
  const refreshToken = jwt.sign(
    {
      sessionId: refreshSession.id,
      tokenId,
      username,
      userId,
      sessionVersion,
    },
    envConfig.jwtRefreshSecret,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION_SECONDS,
    },
  );

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
    ...(await getTokens(newUser.username, newUser.id, newUser.sessionVersion)),
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
    ...(await getTokens(user.username, user.id, user.sessionVersion)),
    userId: user.id,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, envConfig.jwtRefreshSecret) as RefreshTokenPayload;
  const [session, user] = await Promise.all([
    prisma.refreshSession.findUnique({
      where: { id: decoded.sessionId },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        sessionVersion: true,
      },
    }),
  ]);

  if (!user || !session || session.userId !== user.id || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
    throw new Error('Refresh session is no longer valid');
  }

  const tokenHash = hashRefreshTokenId(decoded.tokenId);

  if (session.revokedAt || session.tokenHash !== tokenHash) {
    await revokeAllRefreshSessions(user.id);
    throw new Error('Refresh session is no longer valid');
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new Error('Refresh session is no longer valid');
  }

  const nextTokenId = randomBytes(32).toString('hex');
  const nextExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_SECONDS * 1000);
  const rotateResult = await prisma.refreshSession.updateMany({
    where: {
      id: session.id,
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      tokenHash: hashRefreshTokenId(nextTokenId),
      expiresAt: nextExpiresAt,
    },
  });

  if (rotateResult.count !== 1) {
    await revokeAllRefreshSessions(user.id);
    throw new Error('Refresh session is no longer valid');
  }

  const accessToken = createAccessToken(user.username, user.id, user.sessionVersion);
  const nextRefreshToken = jwt.sign(
    {
      sessionId: session.id,
      tokenId: nextTokenId,
      username: user.username,
      userId: user.id,
      sessionVersion: user.sessionVersion,
    },
    envConfig.jwtRefreshSecret,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION_SECONDS,
    },
  );

  return { accessToken, refreshToken: nextRefreshToken };
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
        id: true,
        sessionVersion: true,
      },
    });

    if (!user || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshSession.updateMany({
        where: {
          id: decoded.sessionId,
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
      await createUserActivity(
        {
          userId: decoded.userId,
          type: UserActivityType.ACCOUNT_LOGGED_OUT,
          metadata: {
            title: decoded.username,
          },
        },
        tx,
      );
    });
  } catch {
    return;
  }
}

export async function logoutEverywhere(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        sessionVersion: {
          increment: 1,
        },
      },
    });
    await tx.refreshSession.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    await createUserActivity(
      {
        userId: user.id,
        type: UserActivityType.ACCOUNT_LOGGED_OUT,
        metadata: {
          title: user.username,
        },
      },
      tx,
    );
  });

  return true;
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

    await tx.refreshSession.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

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

    await tx.refreshSession.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

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
