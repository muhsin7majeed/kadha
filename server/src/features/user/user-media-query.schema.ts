import { z } from 'zod';

const genresSchema = z
  .string()
  .trim()
  .max(500)
  .transform((value, context) => {
    if (!value) return [];

    const values = value.split(',').map(Number);

    if (values.some((genreId) => !Number.isInteger(genreId) || genreId <= 0)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Genres must be positive integer IDs' });
      return z.NEVER;
    }

    return [...new Set(values)];
  })
  .optional()
  .default('');

const ratingSchema = z
  .union([z.enum(['rated', 'unrated']), z.coerce.number().int().min(1).max(10)])
  .optional();

export const userMediaQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    query: z.string().trim().max(120).optional().default(''),
    mediaType: z.enum(['movie', 'tv']).optional(),
    genres: genresSchema,
    yearFrom: z.coerce.number().int().min(1874).max(9999).optional(),
    yearTo: z.coerce.number().int().min(1874).max(9999).optional(),
    rating: ratingSchema,
    sort: z.enum(['added', 'title', 'releaseDate', 'runtime', 'tmdbScore', 'rating']).optional().default('added'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .superRefine((query, context) => {
    if (query.yearFrom !== undefined && query.yearTo !== undefined && query.yearFrom > query.yearTo) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yearTo'],
        message: 'Through year must be the same as or later than from year',
      });
    }

    if (query.sort === 'runtime' && query.mediaType === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sort'],
        message: 'Runtime sorting requires a media type',
      });
    }
  });

export type UserMediaQuery = z.infer<typeof userMediaQuerySchema>;
