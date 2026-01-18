import { envConfig } from '@/config/env';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';


type AccessTokenPayload = jwt.JwtPayload & {
  userId: string;
  username: string;
};

declare module 'express' {
  interface Request {
    user?: any;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and follows Bearer token format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract token from "Bearer <token>" format (standard RFC 6750)
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, envConfig.jwtAccessSecret) as AccessTokenPayload;
    req.user = {
      id: decoded.userId, username: decoded.username
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
