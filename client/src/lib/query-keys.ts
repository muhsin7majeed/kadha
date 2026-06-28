import { MediaType } from '@/types/common';

interface CollectionsParams {
  mediaId: number;
  mediaType: MediaType;
}

export const queryKeys = {
  genreMap: ['genreMap'] as const,
  me: ['me'] as const,
  notifications: ['notifications'] as const,
  collections: ['collections'] as const,
  collectionsList: (params?: CollectionsParams) => ['collections', params] as const,
  collection: ['collection'] as const,
  collectionById: (id?: string) => ['collection', id] as const,
  friendships: ['friendships'] as const,
  friendshipsByType: (type: string) => ['friendships', type] as const,
  searchUsers: ['search-users'] as const,
  searchUsersByQuery: (query: string) => ['search-users', query] as const,
  userProfile: (username?: string) => ['user-profile', username] as const,
  userWatched: (username?: string) => ['user-watched', username] as const,
  userLiked: (username?: string) => ['user-liked', username] as const,
  userWatchList: (username?: string) => ['user-watch-list', username] as const,
  userCollections: (username?: string) => ['user-collections', username] as const,
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
