import { z } from 'zod';

import { EXPORT_CATEGORIES } from './user-export.types';

export const exportQuerySchema = z.object({
  categories: z
    .string()
    .optional()
    .transform((value) => value?.split(',').filter(Boolean) ?? [...EXPORT_CATEGORIES])
    .pipe(z.array(z.enum(EXPORT_CATEGORIES)).min(1, 'Select at least one export category')),
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;
