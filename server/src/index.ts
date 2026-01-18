import 'express-async-errors';

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { envConfig } from './config/env';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { errorHandler } from './middlewares/errorHandler';
import mediaRoutes from './routes/media';
import { authMiddleware } from './middlewares/auth';
import userMediaRoutes from './routes/user-media';
import cookieParser from 'cookie-parser';

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

// Connect to MongoDB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/user-media', authMiddleware, userMediaRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to What to Watch API' });
});

// Health check endpoint for Docker
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use(errorHandler);

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
