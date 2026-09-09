import { NAVIGATION_REGISTRY } from './navigation-registry';
import type { NavigationItemId, NavigationPreferences } from './navigation.types';

const DEFAULT_VISIBLE_ITEMS = new Set<NavigationItemId>([
  'home',
  'recommendations',
  'watchlist',
  'in-progress',
  'collections',
  'menu',
]);

export const DEFAULT_NAVIGATION_PREFERENCES: NavigationPreferences = {
  version: 1,
  layout: 'compact',
  items: NAVIGATION_REGISTRY.map((item) => ({
    id: item.id,
    visible: DEFAULT_VISIBLE_ITEMS.has(item.id),
    display: 'both',
  })),
};
