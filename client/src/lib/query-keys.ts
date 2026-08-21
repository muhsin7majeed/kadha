import { MediaType, UserRole } from '@/types/common';

interface CollectionsParams {
  mediaId?: number;
  mediaType?: MediaType;
  scope?: 'all' | 'mine' | 'shared';
}

interface AdminUsersListParams {
  page: number;
  limit: number;
  query: string;
  sort: 'username' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
  role: UserRole | 'ALL';
}

export const authQueryKeys = {
  me: ['me'] as const,
  recoveryCodeStatus: ['auth', 'recovery-code-status'] as const,
};

export const activityQueryKeys = {
  activity: ['activity'] as const,
  activityPage: (page = 1) => ['activity', page] as const,
};

export const adminQueryKeys = {
  adminOverview: ['admin', 'overview'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminUsersList: (params: AdminUsersListParams) => ['admin', 'users', params] as const,
  adminUser: (id?: string) => ['admin', 'users', id] as const,
};

export const collectionQueryKeys = {
  collections: ['collections'] as const,
  collectionsList: (params?: CollectionsParams) => ['collections', params] as const,
  collection: ['collection'] as const,
  collectionById: (id?: string) => ['collection', id] as const,
  collectionInvites: (collectionId?: string) => ['collection', collectionId, 'invites'] as const,
  collectionInviteUsers: (collectionId?: string) => ['collection', collectionId, 'invite-users'] as const,
  collectionInviteUserSearch: (collectionId: string, query: string) =>
    ['collection', collectionId, 'invite-users', query] as const,
};

export const friendshipQueryKeys = {
  friendships: ['friendships'] as const,
  friendshipsByType: (type: string, page = 1) => ['friendships', type, page] as const,
};

export const mediaQueryKeys = {
  genreMap: ['genreMap'] as const,
  mediaDetails: ['media-details'] as const,
  mediaDetailsById: (mediaType: MediaType, id: string) => ['media-details', mediaType, id] as const,
  mediaWatchProviders: ['media-watch-providers'] as const,
  mediaWatchProvidersByRegion: (mediaType: MediaType, id: string, region?: string) =>
    ['media-watch-providers', mediaType, id, region] as const,
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

export const notificationQueryKeys = {
  notifications: ['notifications'] as const,
  notificationsPage: (page = 1) => ['notifications', page] as const,
  unreadNotificationsCount: ['notifications', 'unread-count'] as const,
};

export const searchQueryKeys = {
  searchUsers: ['search-users'] as const,
  searchUsersByQuery: (query: string, page = 1) => ['search-users', query, page] as const,
};

export const userQueryKeys = {
  deletionImpact: ['user', 'deletion-impact'] as const,
  userProfiles: ['user-profile'] as const,
  userProfile: (username?: string) => ['user-profile', username] as const,
  userWatchedRoot: ['user-watched'] as const,
  userWatched: (username?: string, page = 1) => ['user-watched', username, page] as const,
  userLikedRoot: ['user-liked'] as const,
  userLiked: (username?: string, page = 1) => ['user-liked', username, page] as const,
  userWatchListRoot: ['user-watch-list'] as const,
  userWatchList: (username?: string, page = 1) => ['user-watch-list', username, page] as const,
  userCollectionsRoot: ['user-collections'] as const,
  userCollections: (username?: string) => ['user-collections', username] as const,
};

export const userMediaQueryKeys = {
  inProgressTvRoot: ['in-progress-tv'] as const,
  inProgressTv: (page = 1, sort = 'recent') => ['in-progress-tv', page, sort] as const,
  liked: ['liked'] as const,
  tvProgress: ['tv-progress'] as const,
  tvProgressByMedia: (mediaId?: number, seasonNumber?: number, includeSpecials = false) =>
    ['tv-progress', mediaId, seasonNumber, includeSpecials] as const,
  watched: ['watched'] as const,
  watchList: ['watch-list'] as const,
};

export const queryKeys = {
  ...authQueryKeys,
  ...activityQueryKeys,
  ...adminQueryKeys,
  ...collectionQueryKeys,
  ...friendshipQueryKeys,
  ...mediaQueryKeys,
  ...notificationQueryKeys,
  ...searchQueryKeys,
  ...userQueryKeys,
  ...userMediaQueryKeys,
};
