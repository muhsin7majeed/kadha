import { z } from 'zod';

import { DEFAULT_WATCH_REGION, isSupportedWatchRegion, normalizeWatchRegion } from '@/constants/watch-regions';

const watchRegionSchema = z
  .string({ required_error: 'Country is required' })
  .min(2, { message: 'Country is required' })
  .transform(normalizeWatchRegion)
  .refine(isSupportedWatchRegion, { message: 'Choose a supported country' });

export const registerSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(1, { message: 'Username is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
  watchRegion: watchRegionSchema.default(DEFAULT_WATCH_REGION),
});

export const loginSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(1, { message: 'Username is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
