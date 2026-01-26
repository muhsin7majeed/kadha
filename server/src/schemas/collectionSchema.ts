import { DataPrivacy, MediaType } from '@/types/common';
import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  privacy: z.nativeEnum(DataPrivacy).default(DataPrivacy.OnlyMe),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  privacy: z.nativeEnum(DataPrivacy).optional(),
});

export const toggleCollectionSchema = z.object({
  id: z.number().optional(),
  media_type: z.nativeEnum(MediaType),
  title: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  adult: z.boolean().optional(),
  genre_ids: z.array(z.number()).optional(),
  release_date: z.string().optional(),
});

export const getCollectionsSchema = z.object({
  mediaId: z.string().optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
});
