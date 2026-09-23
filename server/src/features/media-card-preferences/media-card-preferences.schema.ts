import { z } from 'zod';

export const mediaCardPreferencesSchema = z.object({
  version: z.literal(1),
  style: z.enum(['minimal', 'detailed']),
}).strict();

export type MediaCardPreferences = z.infer<typeof mediaCardPreferencesSchema>;
