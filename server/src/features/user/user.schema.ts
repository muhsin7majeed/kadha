import { DataPrivacy } from '@/types/common';
import { z } from 'zod';

export const updateMeSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(1, 'Username is required').max(40),
  profilePrivacy: z.nativeEnum(DataPrivacy),
  watchedPrivacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.Friends),
  likedPrivacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.Friends),
  watchlistPrivacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.OnlyMe),
});

export type UpdateMePayload = z.infer<typeof updateMeSchema>;
