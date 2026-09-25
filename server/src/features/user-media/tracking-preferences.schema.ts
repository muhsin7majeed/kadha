import { z } from 'zod';

import type { TrackingPreferencesDocument } from './tracking-preferences.types';

export const trackingPreferencesSchema: z.ZodType<TrackingPreferencesDocument> = z
  .object({
    version: z.literal(1),
    keepWatchedOnWatchlist: z.boolean(),
    hideCaughtUpWithoutScheduledNext: z.boolean(),
  })
  .strict();
