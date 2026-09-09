import { prisma } from '@/lib/prisma';
import { navigationPreferencesSchema, type NavigationPreferencesPayload } from './navigation-preferences.schema';
import {
  NAVIGATION_ITEM_IDS,
  type NavigationItemId,
  type NavigationPreferenceItem,
  type NavigationPreferencesDocument,
} from './navigation-preferences.types';

const DEFAULT_VISIBLE_ITEMS = new Set<NavigationItemId>([
  'home',
  'recommendations',
  'watchlist',
  'in-progress',
  'collections',
  'menu',
]);
const MANDATORY_ITEMS = new Set<NavigationItemId>(['home', 'menu']);

const defaultItem = (id: NavigationItemId): NavigationPreferenceItem => ({
  id,
  visible: DEFAULT_VISIBLE_ITEMS.has(id),
  display: 'both',
});

export const DEFAULT_NAVIGATION_PREFERENCES: NavigationPreferencesDocument = {
  version: 1,
  layout: 'compact',
  items: NAVIGATION_ITEM_IDS.map(defaultItem),
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseStoredNavigationPreferences = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const normalizeItems = (items: unknown, missingItemsVisibleByDefault: boolean) => {
  const knownIds = new Set<string>(NAVIGATION_ITEM_IDS);
  const seen = new Set<NavigationItemId>();
  const normalized: NavigationPreferenceItem[] = [];

  if (Array.isArray(items)) {
    for (const item of items) {
      if (!isRecord(item) || typeof item.id !== 'string' || !knownIds.has(item.id) || seen.has(item.id as NavigationItemId)) {
        continue;
      }

      const id = item.id as NavigationItemId;
      const display = item.display === 'icon' || item.display === 'label' || item.display === 'both' ? item.display : 'both';
      normalized.push({
        id,
        visible: MANDATORY_ITEMS.has(id) || item.visible === true,
        display,
      });
      seen.add(id);
    }
  }

  for (const id of NAVIGATION_ITEM_IDS) {
    if (seen.has(id)) continue;
    const item = defaultItem(id);
    normalized.push({
      ...item,
      visible: MANDATORY_ITEMS.has(id) || (missingItemsVisibleByDefault && item.visible),
    });
  }

  return normalized;
};

export const normalizeNavigationPreferences = (
  value: unknown,
  missingItemsVisibleByDefault = true,
): NavigationPreferencesDocument => {
  const record = isRecord(value) ? value : {};
  const layout = record.layout === 'scrollable' || record.layout === 'grid' ? record.layout : 'compact';
  const items = normalizeItems(record.items, missingItemsVisibleByDefault);

  if (layout === 'compact') {
    const mandatoryCount = items.filter((item) => MANDATORY_ITEMS.has(item.id)).length;
    let optionalSlots = 6 - mandatoryCount;
    for (const item of items) {
      if (!MANDATORY_ITEMS.has(item.id) && item.visible) {
        item.visible = optionalSlots > 0;
        optionalSlots -= 1;
      }
    }
  }

  return { version: 1, layout, items };
};

export const getNavigationPreferences = async (userId: string) => {
  const stored = await prisma.navigationPreferences.findUnique({ where: { userId } });
  return stored
    ? normalizeNavigationPreferences(parseStoredNavigationPreferences(stored.config))
    : structuredClone(DEFAULT_NAVIGATION_PREFERENCES);
};

export const updateNavigationPreferences = async (userId: string, payload: NavigationPreferencesPayload) => {
  const preferences = normalizeNavigationPreferences(payload, false);
  const validated = navigationPreferencesSchema.parse(preferences);

  await prisma.navigationPreferences.upsert({
    where: { userId },
    update: { config: JSON.stringify(validated) },
    create: { userId, config: JSON.stringify(validated) },
  });

  return validated;
};
