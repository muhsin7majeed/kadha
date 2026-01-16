import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(1, { message: 'Username is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export const loginSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(1, { message: 'Username is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});
