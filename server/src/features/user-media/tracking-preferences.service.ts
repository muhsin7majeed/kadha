import { prisma } from '@/lib/prisma';
import type { TrackingPreferencesDocument } from './tracking-preferences.types';

export const DEFAULT_TRACKING_PREFERENCES: TrackingPreferencesDocument = {
  version: 1,
  keepWatchedOnWatchlist: false,
  hideCaughtUpWithoutScheduledNext: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeTrackingPreferences = (value: unknown): TrackingPreferencesDocument => {
  if (!isRecord(value) || value.version !== 1) {
    return { ...DEFAULT_TRACKING_PREFERENCES };
  }

  return {
    version: 1,
    keepWatchedOnWatchlist: value.keepWatchedOnWatchlist === true,
    hideCaughtUpWithoutScheduledNext: value.hideCaughtUpWithoutScheduledNext === true,
  };
};

export const parseStoredTrackingPreferences = (config: string): TrackingPreferencesDocument => {
  try {
    return normalizeTrackingPreferences(JSON.parse(config) as unknown);
  } catch {
    return { ...DEFAULT_TRACKING_PREFERENCES };
  }
};

export const getTrackingPreferences = async (userId: string) => {
  const stored = await prisma.trackingPreferences.findUnique({ where: { userId } });
  return stored ? parseStoredTrackingPreferences(stored.config) : { ...DEFAULT_TRACKING_PREFERENCES };
};

export const shouldPreserveWatchlistForTitleWatchedChange = async (userId: string) =>
  (await getTrackingPreferences(userId)).keepWatchedOnWatchlist;

export const updateTrackingPreferences = async (userId: string, preferences: TrackingPreferencesDocument) => {
  await prisma.trackingPreferences.upsert({
    where: { userId },
    update: { config: JSON.stringify(preferences) },
    create: { userId, config: JSON.stringify(preferences) },
  });

  return preferences;
};
