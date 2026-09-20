import { z } from 'zod';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 92;
const ROLLING_WINDOW_DAYS = 90;

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const addUtcDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Date must be a valid calendar date');

export const upcomingQuerySchema = z
  .object({
    from: calendarDateSchema,
    to: calendarDateSchema,
  })
  .superRefine((query, context) => {
    const from = Date.parse(`${query.from}T00:00:00.000Z`);
    const to = Date.parse(`${query.to}T00:00:00.000Z`);

    if (to < from) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must not be before start date',
        path: ['to'],
      });
      return;
    }

    if ((to - from) / DAY_MS + 1 > MAX_RANGE_DAYS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Date range must be ${MAX_RANGE_DAYS} days or less`,
        path: ['to'],
      });
    }

    const today = new Date();
    const earliestDate = dateOnly(addUtcDays(today, -ROLLING_WINDOW_DAYS));
    const latestDate = dateOnly(addUtcDays(today, ROLLING_WINDOW_DAYS));

    if (query.from < earliestDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start date must be within ${ROLLING_WINDOW_DAYS} days of today`,
        path: ['from'],
      });
    }

    if (query.to > latestDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `End date must be within ${ROLLING_WINDOW_DAYS} days of today`,
        path: ['to'],
      });
    }
  });

export type UpcomingQuery = z.infer<typeof upcomingQuerySchema>;
