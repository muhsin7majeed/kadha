export const HOME_SECTION_IDS = [
  'continue-watching',
  'watchlist',
  'recommendations',
  'trending-movies',
  'trending-tv',
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export interface HomePreferenceItem {
  id: HomeSectionId;
  visible: boolean;
}

export interface HomePreferencesDocument {
  version: 1;
  items: HomePreferenceItem[];
}
