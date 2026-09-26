import type { QueryClient } from '@tanstack/react-query';

import invalidateWatchEventQueries from './invalidate-watch-event-queries';

const invalidateTvProgress = (queryClient: QueryClient, mediaId: number) =>
  invalidateWatchEventQueries(queryClient, { mediaId, mediaType: 'tv' }, true);

export default invalidateTvProgress;
