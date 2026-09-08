import { z } from 'zod';

import { IMPORT_CATEGORIES } from './user-export.types';

const exportDataSchema = z.record(z.unknown()).superRefine((value, context) => {
  const schemaVersion = value.schemaVersion;

  if (schemaVersion !== undefined && schemaVersion !== 1 && schemaVersion !== 2) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'This Kadha export version is not supported',
      path: ['schemaVersion'],
    });
  }

  if (schemaVersion === 2) {
    if (value.format !== 'kadha-data-export') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'This is not a valid Kadha data export',
        path: ['format'],
      });
    }
    if (typeof value.data !== 'object' || value.data === null || Array.isArray(value.data)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'This Kadha export does not contain a valid data section',
        path: ['data'],
      });
    }
  }
});

export const importPayloadSchema = z.object({
  export: exportDataSchema,
  options: z
    .object({
      categories: z.array(z.enum(IMPORT_CATEGORIES)).min(1).optional(),
      overwriteUserMediaDetails: z.boolean().optional(),
      overwriteRecommendationSettings: z.boolean().optional(),
    })
    .optional(),
});

export type ImportPayload = z.infer<typeof importPayloadSchema>;
