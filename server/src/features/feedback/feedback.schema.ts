import { FeedbackCategory, FeedbackStatus } from '@prisma/client';
import { z } from 'zod';

const optionalTrimmed = (max: number) => z.string().trim().max(max).optional().nullable();

export const createFeedbackSchema = z.object({
  category: z.nativeEnum(FeedbackCategory),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(5000),
  sourcePath: optionalTrimmed(500),
  appVersion: optionalTrimmed(50),
});

export const updateFeedbackSchema = z
  .object({
    status: z.nativeEnum(FeedbackStatus).optional(),
    adminResponse: optionalTrimmed(5000),
  })
  .refine((value) => value.status !== undefined || value.adminResponse !== undefined, {
    message: 'At least one feedback update is required',
  });

export const adminFeedbackQuerySchema = z.object({
  query: z.string().trim().max(120).optional().default(''),
  category: z.nativeEnum(FeedbackCategory).optional(),
  status: z.union([z.nativeEnum(FeedbackStatus), z.literal('OPEN')]).optional(),
  sort: z.enum(['createdAt', 'updatedAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
