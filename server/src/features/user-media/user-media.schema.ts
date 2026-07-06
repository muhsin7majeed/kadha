import { z } from 'zod';

const noteSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().max(500, 'Note must be 500 characters or less').nullable().optional(),
);

const getTodayDateOnly = () => new Date().toISOString().slice(0, 10);

const watchedOnSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Watched date must be a valid date')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, {
    message: 'Watched date must be a valid date',
  })
  .refine((value) => value <= getTodayDateOnly(), {
    message: 'Watched date cannot be in the future',
  });

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
  rating: z.number().int().min(1).max(10).nullable().optional(),
  watchedOn: watchedOnSchema.nullable().optional(),
  likedNote: noteSchema,
  watchedNote: noteSchema,
  watchlistNote: noteSchema,
});

export const episodeWatchSchema = z.object({
  seasonNumber: z.number().int().min(0),
  episodeNumber: z.number().int().min(1),
  episodeId: z.number().int().positive().nullable().optional(),
  watchedOn: watchedOnSchema.nullable().optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  note: noteSchema,
});

export type UserMediaPayload = z.infer<typeof userMediaSchema>;
export type EpisodeWatchPayload = z.infer<typeof episodeWatchSchema>;
