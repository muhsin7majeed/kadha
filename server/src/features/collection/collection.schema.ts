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
  original_title: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  popularity: z.number().nullable().optional(),
  adult: z.boolean().optional(),
  genre_ids: z.array(z.number()).optional(),
  release_date: z.string().optional(),
  original_language: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
});

export const getCollectionsSchema = z.object({
  mediaId: z.string().optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
});

export type GetCollectionsQuery = z.infer<typeof getCollectionsSchema>;
export type CollectionPayload = z.infer<typeof createCollectionSchema>;
export type ToggleCollectionPayload = z.infer<typeof toggleCollectionSchema> & {
  media_id: number;
};
