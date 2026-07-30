import { envConfig } from '@/config/env';
import { unauthorized } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type AccessTokenPayload = jwt.JwtPayload & {
  userId: string;
  username: string;
  sessionVersion?: number;
};

export interface AuthenticatedUser {
  id: string;
  username: string;
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

const isAccessTokenPayload = (value: string | jwt.JwtPayload): value is AccessTokenPayload => {
  return (
    typeof value !== 'string' &&
    typeof value.userId === 'string' &&
    typeof value.username === 'string' &&
    (value.sessionVersion === undefined || typeof value.sessionVersion === 'number')
  );
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and follows Bearer token format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorized());
  }

  // Extract token from "Bearer <token>" format (standard RFC 6750)
  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(unauthorized());
  }

  let decoded: string | jwt.JwtPayload;

  try {
    decoded = jwt.verify(token, envConfig.jwtAccessSecret);
  } catch {
    return next(unauthorized());
  }

  if (!isAccessTokenPayload(decoded)) {
    return next(unauthorized());
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      username: true,
      sessionVersion: true,
    },
  });

  if (!user || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
    return next(unauthorized());
  }

  req.user = {
    id: user.id,
    username: user.username,
  };

  return next();
};

export const requireAuthUser = (req: Request) => {
  if (!req.user) {
    throw unauthorized();
  }

  return req.user;
};
