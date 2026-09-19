import { prisma } from '@/lib/prisma';
import { homePreferencesSchema, type HomePreferencesPayload } from './home-preferences.schema';
import {
  HOME_SECTION_IDS,
  type HomePreferenceItem,
  type HomePreferencesDocument,
  type HomeSectionId,
} from './home-preferences.types';

const defaultItem = (id: HomeSectionId): HomePreferenceItem => ({ id, visible: true });

export const DEFAULT_HOME_PREFERENCES: HomePreferencesDocument = {
  version: 1,
  items: HOME_SECTION_IDS.map(defaultItem),
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseStoredHomePreferences = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

export const normalizeHomePreferences = (
  value: unknown,
  missingSectionsVisibleByDefault = true,
): HomePreferencesDocument => {
  const record = isRecord(value) ? value : {};
  const knownIds = new Set<string>(HOME_SECTION_IDS);
  const seen = new Set<HomeSectionId>();
  const items: HomePreferenceItem[] = [];

  if (Array.isArray(record.items)) {
    for (const item of record.items) {
      if (!isRecord(item) || typeof item.id !== 'string' || !knownIds.has(item.id) || seen.has(item.id as HomeSectionId)) {
        continue;
      }

      const id = item.id as HomeSectionId;
      items.push({ id, visible: item.visible === true });
      seen.add(id);
    }
  }

  for (const id of HOME_SECTION_IDS) {
    if (!seen.has(id)) {
      items.push({ id, visible: missingSectionsVisibleByDefault });
    }
  }

  return { version: 1, items };
};

export const getHomePreferences = async (userId: string) => {
  const stored = await prisma.homePreferences.findUnique({ where: { userId } });
  return stored
    ? normalizeHomePreferences(parseStoredHomePreferences(stored.config))
    : structuredClone(DEFAULT_HOME_PREFERENCES);
};

export const updateHomePreferences = async (userId: string, payload: HomePreferencesPayload) => {
  const preferences = normalizeHomePreferences(payload, false);
  const validated = homePreferencesSchema.parse(preferences);

  await prisma.homePreferences.upsert({
    where: { userId },
    update: { config: JSON.stringify(validated) },
    create: { userId, config: JSON.stringify(validated) },
  });

  return validated;
};
