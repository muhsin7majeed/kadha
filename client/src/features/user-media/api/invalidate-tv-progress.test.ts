import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import invalidateTvProgress from './invalidate-tv-progress';

describe('TV episode progress invalidation', () => {
  it('refreshes Diary and Upcoming after marking an episode watched', async () => {
    const queryClient = new QueryClient();
    const diaryKey = queryKeys.diaryRoot;
    const insightKey = queryKeys.diaryInsightsRoot;
    const upcomingKey = upcomingQueryKeys.schedule({ from: '2026-09-01', to: '2026-10-01' });
    queryClient.setQueryData(diaryKey, { data: [] });
    queryClient.setQueryData(insightKey, { data: { totalWatches: 0 } });
    queryClient.setQueryData(upcomingKey, { data: [{ media_id: 12, watched: false }] });
    const diary = new QueryObserver(queryClient, {
      queryKey: diaryKey, queryFn: () => ({ data: [{ media_id: 12 }] }), staleTime: Infinity,
    });
    const insights = new QueryObserver(queryClient, {
      queryKey: insightKey, queryFn: () => ({ data: { totalWatches: 1 } }), staleTime: Infinity,
    });
    const upcoming = new QueryObserver(queryClient, {
      queryKey: upcomingKey, queryFn: () => ({ data: [{ media_id: 12, watched: true }] }), staleTime: Infinity,
    });
    const unsubscribe = [diary, insights, upcoming].map((observer) => observer.subscribe(() => undefined));

    try {
      await invalidateTvProgress(queryClient, 12);
      expect(queryClient.getQueryData(diaryKey)).toEqual({ data: [{ media_id: 12 }] });
      expect(queryClient.getQueryData(insightKey)).toEqual({ data: { totalWatches: 1 } });
      expect(queryClient.getQueryData(upcomingKey)).toEqual({ data: [{ media_id: 12, watched: true }] });
    } finally {
      unsubscribe.forEach((stop) => stop());
    }
  });
});
