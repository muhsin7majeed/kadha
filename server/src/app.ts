import 'express-async-errors';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';

import { envConfig } from './config/env';
import authRoutes from './features/auth/auth.routes';
import collectionRoutes from './features/collection/collection.routes';
import friendshipRoutes from './features/friendship/friendship.routes';
import mediaRoutes from './features/media/media.routes';
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
  app.use('/api/media', authMiddleware, mediaRoutes);
  app.use('/api/user-media', authMiddleware, userMediaRoutes);
  app.use('/api/collection', authMiddleware, collectionRoutes);
  app.use('/api/friendship', authMiddleware, friendshipRoutes);

  app.get('/', (req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${envConfig.appName} API</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #0a0a0a; color: #fafafa; }
      h1 { color: #ef4444; }
      p { line-height: 1.6; color: #a1a1aa; }
    </style>
</head>
<body>
    <h1>Hey! What are you doing here?</h1>
    <p>This is an API server. You shouldn't be here.</p>
    <p>You probably want to go to <a href="${envConfig.appUrl}">${envConfig.appUrl}</a></p>
    <p>Or <a href="https://github.com/muhsin7majeed/kadha">https://github.com/muhsin7majeed/kadha</a></p>
    <p>Or</p>
    <p>Go watch a movie or something.</p>
    <p>Seriously, there's nothing for you here.</p>
    <p>No buttons. No forms. No pretty pictures.</p>
    <p>Just cold, heartless JSON responses.</p>
    <p>If you keep poking around, the API will get angry.</p>
    <p>An angry API sends 500 errors.</p>
    <p>500 errors crash your app.</p>
    <p>Crashed apps make users sad.</p>
    <p>Sad users leave bad reviews.</p>
    <p>Bad reviews tank your ratings.</p>
    <p>And then you'll have nothing to watch.</p>
    <p><strong>Go use the actual app. Shoo.</strong></p>
</body>
</html>
  `);
  });

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', version: envConfig.version });
  });

  app.use(errorHandler);

  return app;
}
