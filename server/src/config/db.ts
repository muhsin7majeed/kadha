import mongoose from 'mongoose';
import { envConfig } from './env';

export const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.mongoUri);
    console.log('MongoDB connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
