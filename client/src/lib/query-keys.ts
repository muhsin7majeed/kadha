import { MediaType } from '@/types/common';

interface CollectionsParams {
  mediaId?: number;
  mediaType?: MediaType;
  scope?: 'all' | 'mine' | 'shared';
}

export const queryKeys = {
  genreMap: ['genreMap'] as const,
  me: ['me'] as const,
  notifications: ['notifications'] as const,
  notificationsPage: (page = 1) => ['notifications', page] as const,
  unreadNotificationsCount: ['notifications', 'unread-count'] as const,
  activity: ['activity'] as const,
  activityPage: (page = 1) => ['activity', page] as const,
  adminOverview: ['admin', 'overview'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminUsersList: (params: unknown) => ['admin', 'users', params] as const,
  adminUser: (id?: string) => ['admin', 'users', id] as const,
  collections: ['collections'] as const,
  collectionsList: (params?: CollectionsParams) => ['collections', params] as const,
  collection: ['collection'] as const,
  collectionById: (id?: string) => ['collection', id] as const,
  collectionInvites: (collectionId?: string) => ['collection', collectionId, 'invites'] as const,
  collectionInviteUsers: (collectionId?: string) => ['collection', collectionId, 'invite-users'] as const,
  collectionInviteUserSearch: (collectionId: string, query: string) =>
    ['collection', collectionId, 'invite-users', query] as const,
  friendships: ['friendships'] as const,
  friendshipsByType: (type: string, page = 1) => ['friendships', type, page] as const,
  searchUsers: ['search-users'] as const,
  searchUsersByQuery: (query: string, page = 1) => ['search-users', query, page] as const,
  userProfile: (username?: string) => ['user-profile', username] as const,
  userWatched: (username?: string, page = 1) => ['user-watched', username, page] as const,
  userLiked: (username?: string, page = 1) => ['user-liked', username, page] as const,
  userWatchList: (username?: string, page = 1) => ['user-watch-list', username, page] as const,
  userCollections: (username?: string) => ['user-collections', username] as const,
  liked: ['liked'] as const,
  watched: ['watched'] as const,
  watchList: ['watch-list'] as const,
  mediaDetails: ['media-details'] as const,
  mediaDetailsById: (mediaType: MediaType, id: string) => ['media-details', mediaType, id] as const,
  searchMedia: ['search-media'] as const,
  searchMediaByQuery: (mediaType: MediaType, query: string, page = 1) =>
    ['search-media', mediaType, query, page] as const,
  trendingMovies: ['trending-movies'] as const,
  trendingTvs: ['trending-tvs'] as const,
  topRatedMovies: ['top-rated-movies'] as const,
  topRatedTvs: ['top-rated-tvs'] as const,
  popularMovies: ['popular-movies'] as const,
  popularTvs: ['popular-tvs'] as const,
};
