import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

const invalidateTvProgress = (queryClient: QueryClient, mediaId: number) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.tvProgress }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inProgressTvRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.mediaDetails }),
    queryClient.invalidateQueries({ queryKey: queryKeys.watchList }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userWatchListRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.viewingInsightsRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.mediaDetailsById('tv', String(mediaId)) }),
  ]);

export default invalidateTvProgress;
