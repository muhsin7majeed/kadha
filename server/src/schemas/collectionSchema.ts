import { z } from 'zod';

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    privacy: z.enum(['ONLY_ME', 'FRIENDS', 'EVERYONE']).default('ONLY_ME'),
  }),
});

export const updateCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    privacy: z.enum(['ONLY_ME', 'FRIENDS', 'EVERYONE']).optional(),
  }),
});

export const addToCollectionSchema = z.object({
  body: z.object({
    id: z.number(),
    media_type: z.enum(['movie', 'tv']),
    title: z.string().optional(),
    poster_path: z.string().nullable().optional(),
    vote_average: z.number().optional(),
    vote_count: z.number().optional(),
    adult: z.boolean().optional(),
    genre_ids: z.array(z.number()).optional(),
    release_date: z.string().optional(),
  }),
});
