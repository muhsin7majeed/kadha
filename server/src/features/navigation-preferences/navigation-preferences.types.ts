export const NAVIGATION_ITEM_IDS = [
  'home',
  'recommendations',
  'watchlist',
  'in-progress',
  'collections',
  'activity',
  'watched',
  'liked',
  'friends',
  'settings',
  'menu',
] as const;

export type NavigationItemId = (typeof NAVIGATION_ITEM_IDS)[number];
export type NavigationLayout = 'compact' | 'scrollable' | 'grid';
export type NavigationItemDisplay = 'icon' | 'label' | 'both';

export interface NavigationPreferenceItem {
  id: NavigationItemId;
  visible: boolean;
  display: NavigationItemDisplay;
}

export interface NavigationPreferencesDocument {
  version: 1;
  layout: NavigationLayout;
  items: NavigationPreferenceItem[];
}
