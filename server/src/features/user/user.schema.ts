import { DataPrivacy } from '@/types/common';
import { z } from 'zod';

import { isSupportedWatchRegion, normalizeWatchRegion } from '@/constants/watch-regions';

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

export type UpdateMePayload = z.infer<typeof updateMeSchema>;
