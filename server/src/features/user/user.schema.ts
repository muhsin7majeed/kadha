import { DataPrivacy } from '@/types/common';
import { z } from 'zod';

import { isSupportedWatchRegion, normalizeWatchRegion } from '@/constants/watch-regions';

export const DELETE_ACCOUNT_CONFIRMATION = 'I understand this account cannot be recovered';

export const updateMeSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(1, 'Username is required').max(40),
  profilePrivacy: z.nativeEnum(DataPrivacy),
  watchedPrivacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.OnlyMe),
  likedPrivacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.OnlyMe),
  watchlistPrivacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.OnlyMe),
  watchRegion: z
    .string({ required_error: 'Country is required' })
    .min(2, { message: 'Country is required' })
    .transform(normalizeWatchRegion)
    .refine(isSupportedWatchRegion, { message: 'Choose a supported country' }),
});

export const deleteMeSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required'),
  confirmation: z
    .string({ required_error: 'Confirmation is required' })
    .refine((value) => value === DELETE_ACCOUNT_CONFIRMATION, {
      message: `Type “${DELETE_ACCOUNT_CONFIRMATION}” exactly`,
    }),
});

export type UpdateMePayload = z.infer<typeof updateMeSchema>;
export type DeleteMePayload = z.infer<typeof deleteMeSchema>;
