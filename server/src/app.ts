import 'express-async-errors';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';

import { getHealth, getRoot } from './app.controller';
import authRoutes from './features/auth/auth.routes';
import collectionRoutes from './features/collection/collection.routes';
import friendshipRoutes from './features/friendship/friendship.routes';
import mediaRoutes from './features/media/media.routes';
import notificationRoutes from './features/notification/notification.routes';
import userRoutes from './features/user/user.routes';
import userMediaRoutes from './features/user-media/user-media.routes';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';

export function createApp(): Express {
  const app: Express = express();

  const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/user', authMiddleware, userRoutes);
  app.use('/api/users', authMiddleware, userRoutes);
  app.use('/api/media', authMiddleware, mediaRoutes);
  app.use('/api/user-media', authMiddleware, userMediaRoutes);
  app.use('/api/collection', authMiddleware, collectionRoutes);
  app.use('/api/friendship', authMiddleware, friendshipRoutes);
  app.use('/api/notifications', authMiddleware, notificationRoutes);

  app.get('/', getRoot);
  app.get('/health', getHealth);

  app.use(errorHandler);

  return app;
}
