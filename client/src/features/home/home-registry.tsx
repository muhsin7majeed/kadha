import type { ComponentType } from 'react';

import ContinueWatchingHomeSection from '@/features/home/components/continue-watching-home-section';
import RecommendationsHomeSection from '@/features/home/components/recommendations-home-section';
import { TrendingMoviesHomeSection, TrendingTvHomeSection } from '@/features/home/components/trending-home-sections';
import WatchlistHomeSection from '@/features/home/components/watchlist-home-section';
import type { HomeSectionId } from '@/features/home/home.types';

export const HOME_SECTION_REGISTRY: Record<HomeSectionId, ComponentType> = {
  'continue-watching': ContinueWatchingHomeSection,
  watchlist: WatchlistHomeSection,
  recommendations: RecommendationsHomeSection,
  'trending-movies': TrendingMoviesHomeSection,
  'trending-tv': TrendingTvHomeSection,
};
