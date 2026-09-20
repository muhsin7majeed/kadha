export type NavigationItemId =
  | 'home'
  | 'discover'
  | 'recommendations'
  | 'watchlist'
  | 'in-progress'
  | 'upcoming'
  | 'collections'
  | 'activity'
  | 'diary'
  | 'watched'
  | 'liked'
  | 'friends'
  | 'settings'
  | 'menu';

export type NavigationLayout = 'compact' | 'scrollable' | 'grid';
export type NavigationItemDisplay = 'icon' | 'label' | 'both';

export interface NavigationPreferenceItem {
  id: NavigationItemId;
  visible: boolean;
  display: NavigationItemDisplay;
}

export interface NavigationPreferences {
  version: 1;
  layout: NavigationLayout;
  items: NavigationPreferenceItem[];
}
