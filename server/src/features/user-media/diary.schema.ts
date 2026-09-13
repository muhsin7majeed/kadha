import { z } from 'zod';

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Date must be a valid calendar date');

export const diaryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    mediaType: z.enum(['all', 'movie', 'tv']).optional().default('all'),
    year: z.coerce.number().int().min(1).max(9999).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    date: dateOnlySchema.optional(),
  })
  .superRefine((query, context) => {
    if (query.month !== undefined && query.year === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Month requires year',
        path: ['month'],
      });
    }

    if (query.date !== undefined && (query.year !== undefined || query.month !== undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date cannot be combined with year or month',
        path: ['date'],
      });
    }
  });

export type DiaryQuery = z.infer<typeof diaryQuerySchema>;
