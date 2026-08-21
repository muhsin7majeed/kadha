import { z } from 'zod';

import { DEFAULT_WATCH_REGION, isSupportedWatchRegion, normalizeWatchRegion } from '@/constants/watch-regions';

const watchRegionSchema = z
  .string({ required_error: 'Country is required' })
  .min(2, { message: 'Country is required' })
  .transform(normalizeWatchRegion)
  .refine(isSupportedWatchRegion, { message: 'Choose a supported country' });

const usernameSchema = z.string({ required_error: 'Username is required' }).min(1, { message: 'Username is required' });

const credentialPasswordSchema = z.string({ required_error: 'Password is required' }).min(1, {
  message: 'Password is required',
});

export const newPasswordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters long' });

export const registerSchema = z.object({
  username: usernameSchema,
  password: newPasswordSchema,
  watchRegion: watchRegionSchema.default(DEFAULT_WATCH_REGION),
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: credentialPasswordSchema,
});

export const manageRecoveryCodeSchema = z.object({
  currentPassword: credentialPasswordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: credentialPasswordSchema,
  newPassword: newPasswordSchema,
});

export const recoverAccountSchema = z.object({
  username: usernameSchema,
  recoveryCode: z
    .string({ required_error: 'Recovery code is required' })
    .min(1, { message: 'Recovery code is required' }),
  newPassword: newPasswordSchema,
});

export type LoginBody = z.infer<typeof loginSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
export type ManageRecoveryCodeBody = z.infer<typeof manageRecoveryCodeSchema>;
export type RecoverAccountBody = z.infer<typeof recoverAccountSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
