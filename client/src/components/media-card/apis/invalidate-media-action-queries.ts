import { QueryClient, QueryKey } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

export type MediaAction = 'liked' | 'watched' | 'watchlist';

const mediaContentQueryKeys: QueryKey[] = [
  queryKeys.mediaDetails,
  queryKeys.searchMedia,
  queryKeys.trendingMovies,
  queryKeys.trendingTvs,
  queryKeys.topRatedMovies,
  queryKeys.topRatedTvs,
  queryKeys.popularMovies,
  queryKeys.popularTvs,
];

const mediaActionQueryKeys: Record<MediaAction, QueryKey[]> = {
  liked: [queryKeys.liked],
  watched: [queryKeys.watched, queryKeys.watchList],
  watchlist: [queryKeys.watchList],
};

export const invalidateMediaActionQueries = (queryClient: QueryClient, action: MediaAction) => {
  [...mediaContentQueryKeys, ...mediaActionQueryKeys[action]].forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
};
