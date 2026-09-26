import { QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import useImportUserData from './use-import-user-data';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/lib/axios-instance', () => ({ default: { post: mocks.post } }));
vi.mock('@/components/ui/toaster-store', () => ({ toaster: { success: vi.fn() } }));
vi.mock('@/hooks/use-error-handler', () => ({ useErrorHandler: vi.fn() }));

const createWrapper = () =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

const summary = {
  created: { media: 0, watchEvents: 0, collections: 0, collectionItems: 0, recommendationSettings: 0, recommendationFeedback: 0 },
  updated: { accountPreferences: 1, media: 0, recommendationSettings: 0 },
  skipped: {
    accountPreferences: 0, media: 0, watchEvents: 0, collections: 0, collectionItems: 0,
    recommendationSettings: 0, recommendationFeedback: 0, friendships: 0, notifications: 0,
    collectionMemberships: 0, collectionInvites: 0, activity: 0,
  },
};

describe('useImportUserData', () => {
  beforeEach(() => {
    queryClient.clear();
    mocks.post.mockReset();
  });

  it('cancels an inactive preferences read before invalidating after import', async () => {
    let finishOldRead!: (value: { keepWatchedOnWatchlist: boolean }) => void;
    const key = queryKeys.trackingPreferences;
    const queryFn = vi.fn().mockImplementationOnce(
      () => new Promise<{ keepWatchedOnWatchlist: boolean }>((resolve) => { finishOldRead = resolve; }),
    ).mockImplementation(() => Promise.resolve({ keepWatchedOnWatchlist: false }));
    void queryClient.fetchQuery({ queryKey: key, queryFn }).catch(() => undefined);
    mocks.post.mockResolvedValue({ data: { data: summary } });
    const { result } = renderHook(() => useImportUserData(), { wrapper: createWrapper() });

    try {
      await waitFor(() => expect(queryFn).toHaveBeenCalledOnce());
      await act(() => result.current.mutateAsync({ export: {} }));
      finishOldRead({ keepWatchedOnWatchlist: true });
      const observer = new QueryObserver(queryClient, { queryKey: key, queryFn, staleTime: 300_000 });
      const unsubscribe = observer.subscribe(() => undefined);
      try {
        await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
        expect(queryClient.getQueryData(key)).toEqual({ keepWatchedOnWatchlist: false });
      } finally {
        unsubscribe();
      }
    } finally {
      finishOldRead({ keepWatchedOnWatchlist: true });
    }
  });
});
