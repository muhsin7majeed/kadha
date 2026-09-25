import type { QueryClient, QueryKey } from '@tanstack/react-query';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import type { MediaType } from '@/types/common';
import { mediaListKeys } from './invalidate-media-action-queries';

export interface WatchEventIdentity {
  mediaId: number;
  mediaType: MediaType;
}

const invalidateWatchEventQueries = (
  queryClient: QueryClient,
  identity: WatchEventIdentity,
  changesWatchCount: boolean,
) => {
  const keys: QueryKey[] = [
    queryKeys.watchEventsByMedia(identity.mediaType, identity.mediaId),
    queryKeys.diaryRoot,
    queryKeys.diaryInsightsRoot,
    queryKeys.tvProgress,
    queryKeys.mediaDetailsById(identity.mediaType, String(identity.mediaId)),
    queryKeys.watched,
    queryKeys.watchList,
    queryKeys.userWatchedRoot,
    queryKeys.userWatchListRoot,
    queryKeys.viewingInsightsRoot,
    queryKeys.recommendationsRoot,
    ...mediaListKeys,
  ];

  if (changesWatchCount) keys.push(upcomingQueryKeys.root);
  if (changesWatchCount && identity.mediaType === 'tv') keys.push(queryKeys.inProgressTvRoot);

  return Promise.all(keys.map(async (queryKey) => {
    await queryClient.cancelQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey });
  }));
};

export default invalidateWatchEventQueries;
