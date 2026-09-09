import { z } from 'zod';

import { NAVIGATION_ITEM_IDS } from './navigation-preferences.types';

const navigationItemSchema = z
  .object({
    id: z.enum(NAVIGATION_ITEM_IDS),
    visible: z.boolean(),
    display: z.enum(['icon', 'label', 'both']),
  })
  .strict();

export const navigationPreferencesSchema = z
  .object({
    version: z.literal(1),
    layout: z.enum(['compact', 'scrollable', 'grid']),
    items: z.array(navigationItemSchema).max(NAVIGATION_ITEM_IDS.length),
  })
  .strict()
  .superRefine((preferences, context) => {
    const ids = new Set<string>();
    preferences.items.forEach((item, index) => {
      if (ids.has(item.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'id'],
          message: 'Navigation destinations cannot be duplicated',
        });
      }
      ids.add(item.id);
    });

    if (preferences.layout === 'compact') {
      const visibleIds = new Set(preferences.items.filter((item) => item.visible).map((item) => item.id));
      visibleIds.add('home');
      visibleIds.add('menu');
      if (visibleIds.size > 6) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items'],
          message: 'Compact navigation supports at most six visible destinations',
        });
      }
    }
  });

export type NavigationPreferencesPayload = z.infer<typeof navigationPreferencesSchema>;
