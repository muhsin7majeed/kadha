import { z } from 'zod';

export const userMediaSchema = z.object({
  id: z.coerce.string().optional(),
  media_id: z.number({ required_error: 'Media ID is required' }),
  media_type: z.enum(['movie', 'tv'], {
    required_error: 'Media type is required',
  }),

  liked: z.boolean().optional().default(false),
  watched: z.boolean().optional().default(false),
  watchlist: z.boolean().optional().default(false),

  title: z.string({ required_error: 'Title is required' }),
  original_title: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  vote_average: z.number({ required_error: 'Vote average is required' }),
  vote_count: z.number({ required_error: 'Vote count is required' }),
  popularity: z.number().nullable().optional(),
  adult: z.boolean({ required_error: 'Adult is required' }),
  genre_ids: z.array(z.number({ required_error: 'Genre IDs are required' })),
  release_date: z.string({ required_error: 'Release date is required' }),
  original_language: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
});

export type UserMediaPayload = z.infer<typeof userMediaSchema>;
