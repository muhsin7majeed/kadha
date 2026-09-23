import { prisma } from '@/lib/prisma';
import { mediaCardPreferencesSchema, type MediaCardPreferences } from './media-card-preferences.schema';

export const DEFAULT_MEDIA_CARD_PREFERENCES: MediaCardPreferences = { version: 1, style: 'detailed' };

export const normalizeMediaCardPreferences = (value: unknown): MediaCardPreferences => {
  const parsed = mediaCardPreferencesSchema.safeParse(value);
  return parsed.success ? parsed.data : { ...DEFAULT_MEDIA_CARD_PREFERENCES };
};

export const parseStoredMediaCardPreferences = (config: string): MediaCardPreferences => {
  try {
    return normalizeMediaCardPreferences(JSON.parse(config) as unknown);
  } catch {
    return { ...DEFAULT_MEDIA_CARD_PREFERENCES };
  }
};

export const getMediaCardPreferences = async (userId: string) => {
  const stored = await prisma.mediaCardPreferences.findUnique({ where: { userId } });
  return stored ? parseStoredMediaCardPreferences(stored.config) : { ...DEFAULT_MEDIA_CARD_PREFERENCES };
};

export const updateMediaCardPreferences = async (userId: string, preferences: MediaCardPreferences) => {
  await prisma.mediaCardPreferences.upsert({
    where: { userId },
    update: { config: JSON.stringify(preferences) },
    create: { userId, config: JSON.stringify(preferences) },
  });
  return preferences;
};
