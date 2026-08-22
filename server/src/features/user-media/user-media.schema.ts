import { z } from 'zod';

const noteSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().max(500, 'Note must be 500 characters or less').nullable().optional(),
);

const getTodayDateOnly = () => new Date().toISOString().slice(0, 10);

const watchedOnSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Watched date must be a valid date')
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);

      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    {
      message: 'Watched date must be a valid date',
    },
  )
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

const mediaSnapshotSchema = userMediaSchema.pick({
  media_id: true,
  media_type: true,
  title: true,
  original_title: true,
  overview: true,
  poster_path: true,
  backdrop_path: true,
  vote_average: true,
  vote_count: true,
  popularity: true,
  adult: true,
  genre_ids: true,
  release_date: true,
  original_language: true,
  runtime: true,
  status: true,
});

export const watchEventCreateSchema = mediaSnapshotSchema
  .extend({
    seasonNumber: z.number().int().min(0).nullable().optional(),
    episodeNumber: z.number().int().min(1).nullable().optional(),
    episodeId: z.number().int().positive().nullable().optional(),
    watchedOn: watchedOnSchema.nullable().optional(),
    rating: z.number().int().min(1).max(10).nullable().optional(),
    note: noteSchema,
    clientRequestId: z.string().trim().min(1).max(100).optional(),
  })
  .superRefine((payload, context) => {
    const hasSeason = payload.seasonNumber !== undefined && payload.seasonNumber !== null;
    const hasEpisode = payload.episodeNumber !== undefined && payload.episodeNumber !== null;

    if (hasSeason !== hasEpisode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Season and episode numbers must be provided together',
        path: hasSeason ? ['episodeNumber'] : ['seasonNumber'],
      });
    }

    if (payload.media_type === 'movie' && (hasSeason || hasEpisode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Movie watch events cannot include episode details',
        path: ['seasonNumber'],
      });
    }
  });

export const watchEventUpdateSchema = z
  .object({
    watchedOn: watchedOnSchema.nullable().optional(),
    rating: z.number().int().min(1).max(10).nullable().optional(),
    note: noteSchema,
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one watch event field is required',
  });

export type UserMediaPayload = z.infer<typeof userMediaSchema>;
export type EpisodeWatchPayload = z.infer<typeof episodeWatchSchema>;
export type WatchEventCreatePayload = z.infer<typeof watchEventCreateSchema>;
export type WatchEventUpdatePayload = z.infer<typeof watchEventUpdateSchema>;
