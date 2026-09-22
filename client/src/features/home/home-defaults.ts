import type { HomePreferences, HomeSectionId } from './home.types';

export const HOME_SECTION_DETAILS: Record<HomeSectionId, { description: string; label: string }> = {
  'continue-watching': {
    label: 'Continue Watching',
    description: "TV shows you've started and haven't finished.",
  },
  watchlist: {
    label: 'From Your Watchlist',
    description: 'Titles you recently saved for later.',
  },
  recommendations: {
    label: 'For You',
    description: 'Personal suggestions based on the signals you allow.',
  },
  'trending-movies': {
    label: 'Trending Movies',
    description: 'Movies people are watching right now.',
  },
  'trending-tv': {
    label: 'Trending TV',
    description: 'TV shows people are watching right now.',
  },
};

export const DEFAULT_HOME_PREFERENCES: HomePreferences = {
  version: 1,
  items: [
    { id: 'continue-watching', visible: true },
    { id: 'watchlist', visible: true },
    { id: 'recommendations', visible: true },
    { id: 'trending-movies', visible: true },
    { id: 'trending-tv', visible: true },
  ],
};
