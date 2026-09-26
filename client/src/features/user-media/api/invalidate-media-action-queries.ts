import type { QueryClient, QueryKey } from '@tanstack/react-query';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import type { MediaAction, UserMediaPayload } from '../user-media.types';

export const mediaListKeys: QueryKey[] = [
  queryKeys.searchMedia,
  queryKeys.trendingMovies,
  queryKeys.trendingTvs,
  queryKeys.topRatedMovies,
  queryKeys.topRatedTvs,
  queryKeys.popularMovies,
  queryKeys.popularTvs,
  queryKeys.nowPlayingMovies,
  queryKeys.upcomingMovies,
  queryKeys.onTheAirTvs,
  queryKeys.mediaRecommendations,
];

const invalidateMediaActionQueries = (
  queryClient: QueryClient,
  action: MediaAction,
  payload: UserMediaPayload,
) => {
  const keys: QueryKey[] = [
    ...mediaListKeys,
    queryKeys.mediaDetailsById(payload.media_type, String(payload.media_id)),
    queryKeys.liked,
    queryKeys.watched,
    queryKeys.watchList,
    queryKeys.userLikedRoot,
    queryKeys.userWatchedRoot,
    queryKeys.userWatchListRoot,
    queryKeys.recommendationsRoot,
  ];

  if (action !== 'watchlist') keys.push(queryKeys.viewingInsightsRoot);
  if (payload.media_type === 'tv') keys.push(queryKeys.inProgressTvRoot, queryKeys.tvProgress);
  if (payload.media_type === 'tv' || action !== 'liked' || payload.watched === true) {
    keys.push(upcomingQueryKeys.root);
  }

  return Promise.all(keys.map(async (queryKey) => {
    await queryClient.cancelQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey });
  }));
};

export default invalidateMediaActionQueries;
