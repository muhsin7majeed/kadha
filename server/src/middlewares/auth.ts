import { envConfig } from '@/config/env';
import { unauthorized } from '@/lib/http';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type AccessTokenPayload = jwt.JwtPayload & {
  userId: string;
  username: string;
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

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

  try {
    const decoded = jwt.verify(token, envConfig.jwtAccessSecret) as AccessTokenPayload;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
    };
    next();
  } catch {
    return next(unauthorized());
  }
};

export const requireAuthUser = (req: Request) => {
  if (!req.user) {
    throw unauthorized();
  }

  return req.user;
};
