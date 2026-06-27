import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { envConfig } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { LoginAndRegisterBody } from './auth.schema';

const ACCESS_TOKEN_EXPIRATION = '10m';
const REFRESH_TOKEN_EXPIRATION = '1d';

interface RefreshTokenPayload {
  username: string;
  userId: string;
}

export function getTokens(username: string, userId: string) {
  const accessToken = jwt.sign({ username, userId }, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign({ username, userId }, envConfig.jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
}

export async function registerUser({ username, password }: LoginAndRegisterBody) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (user) {
    return { fieldErrors: { username: 'Username already exists' } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  return {
    ...getTokens(newUser.username, newUser.id),
    userId: newUser.id,
  };
}

export async function loginUser({ username, password }: LoginAndRegisterBody) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return {
    ...getTokens(user.username, user.id),
    userId: user.id,
  };
}

export function refreshAccessToken(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, envConfig.jwtRefreshSecret) as RefreshTokenPayload;

  return jwt.sign({ username: decoded.username, userId: decoded.userId }, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
}
