import { z } from 'zod';

import { DEFAULT_WATCH_REGION, isSupportedWatchRegion, normalizeWatchRegion } from '@/constants/watch-regions';

const watchRegionSchema = z
  .string({ required_error: 'Country is required' })
  .min(2, { message: 'Country is required' })
  .transform(normalizeWatchRegion)
  .refine(isSupportedWatchRegion, { message: 'Choose a supported country' });

const usernameSchema = z.string({ required_error: 'Username is required' }).min(1, { message: 'Username is required' });

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(6, { message: 'Password must be at least 6 characters long' });

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  watchRegion: watchRegionSchema.default(DEFAULT_WATCH_REGION),
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const manageRecoveryCodeSchema = z.object({
  currentPassword: passwordSchema,
});

export const recoverAccountSchema = z.object({
  username: usernameSchema,
  recoveryCode: z
    .string({ required_error: 'Recovery code is required' })
    .min(1, { message: 'Recovery code is required' }),
  newPassword: passwordSchema,
});

export type LoginBody = z.infer<typeof loginSchema>;
export type ManageRecoveryCodeBody = z.infer<typeof manageRecoveryCodeSchema>;
export type RecoverAccountBody = z.infer<typeof recoverAccountSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
