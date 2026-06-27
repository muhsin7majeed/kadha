import { MediaType } from '@/types/common';

export const queryKeys = {
  liked: ['liked'] as const,
  watched: ['watched'] as const,
  watchList: ['watch-list'] as const,
  mediaDetails: ['media-details'] as const,
  mediaDetailsById: (mediaType: MediaType, id: string) => ['media-details', mediaType, id] as const,
  searchMedia: ['search-media'] as const,
  searchMediaByQuery: (query: string) => ['search-media', query] as const,
  trendingMovies: ['trending-movies'] as const,
  trendingTvs: ['trending-tvs'] as const,
  topRatedMovies: ['top-rated-movies'] as const,
  topRatedTvs: ['top-rated-tvs'] as const,
  popularMovies: ['popular-movies'] as const,
  popularTvs: ['popular-tvs'] as const,
};
