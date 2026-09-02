import { z } from 'zod';

export const recommendationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const recommendationSettingsSchema = z.object({
  useLiked: z.boolean().optional(),
  useRatings: z.boolean().optional(),
  useWatched: z.boolean().optional(),
  useRewatchHistory: z.boolean().optional(),
  useWatchlist: z.boolean().optional(),
  excludeWatched: z.boolean().optional(),
});

export const recommendationFeedbackSchema = z.object({
  media_id: z.number().int().positive(),
  media_type: z.enum(['movie', 'tv']),
  type: z.enum(['MORE_LIKE_THIS', 'LESS_LIKE_THIS', 'HIDE']),
  title: z.string().optional(),
  original_title: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().int().optional(),
  popularity: z.number().nullable().optional(),
  adult: z.boolean().optional(),
  genre_ids: z.array(z.number().int()).optional(),
  release_date: z.string().optional(),
  original_language: z.string().nullable().optional(),
  runtime: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
});

export type RecommendationsQuery = z.infer<typeof recommendationsQuerySchema>;
export type RecommendationSettingsPayload = z.infer<typeof recommendationSettingsSchema>;
export type RecommendationFeedbackPayload = z.infer<typeof recommendationFeedbackSchema>;
