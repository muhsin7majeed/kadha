export type HomeSectionId =
  | 'continue-watching'
  | 'watchlist'
  | 'recommendations'
  | 'trending-movies'
  | 'trending-tv';

export interface HomePreferenceItem {
  id: HomeSectionId;
  visible: boolean;
}

export interface HomePreferences {
  version: 1;
  items: HomePreferenceItem[];
}
