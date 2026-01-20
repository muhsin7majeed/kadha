import 'express-async-errors';

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { envConfig, validateEnvVars } from './config/env';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { errorHandler } from './middlewares/errorHandler';
import mediaRoutes from './routes/media';
import { authMiddleware } from './middlewares/auth';
import userMediaRoutes from './routes/user-media';
import cookieParser from 'cookie-parser';
import collectionRoutes from './routes/collection';

const app: Express = express();

// CORS configuration - must specify origin (not wildcard) when using credentials
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
};

// Middlewarezz
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/user-media', authMiddleware, userMediaRoutes);
app.use('/api/collection', authMiddleware, collectionRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>What to Watch API</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #0a0a0a; color: #fafafa; }
      h1 { color: #ef4444; }
      p { line-height: 1.6; color: #a1a1aa; }
    </style>
</head>
<body>
    <h1>Hey! What are you doing here?</h1>
    <p>This is an API server. You shouldn't be here.</p>
    <p>You probably want to go to <a href="https://wtw.muhsi.in">https://wtw.muhsi.in</a></p>
    <p>Or <a href="https://github.com/muhsin7majeed/what-to-watch-web">https://github.com/muhsin7majeed/what-to-watch-web</a></p>
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

// Health check endpoint for Docker
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use(errorHandler);

// Validate environment variables before starting server
validateEnvVars();

// Start server
app.listen(envConfig.port, '0.0.0.0', () => {
  console.log(`Server is running on port ${envConfig.port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection');
});
