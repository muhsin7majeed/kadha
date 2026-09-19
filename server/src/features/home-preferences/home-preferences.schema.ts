import { z } from 'zod';

import { HOME_SECTION_IDS } from './home-preferences.types';

const homePreferenceItemSchema = z
  .object({
    id: z.enum(HOME_SECTION_IDS),
    visible: z.boolean(),
  })
  .strict();

export const homePreferencesSchema = z
  .object({
    version: z.literal(1),
    items: z.array(homePreferenceItemSchema).max(HOME_SECTION_IDS.length),
  })
  .strict()
  .superRefine((preferences, context) => {
    const ids = new Set<string>();

    preferences.items.forEach((item, index) => {
      if (ids.has(item.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'id'],
          message: 'Home sections cannot be duplicated',
        });
      }
      ids.add(item.id);
    });
  });

export type HomePreferencesPayload = z.infer<typeof homePreferencesSchema>;
