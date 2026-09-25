import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { upcomingQueryKeys } from '@/lib/query-keys';
import { useCreateWatchEvent, useDeleteWatchEvent, useUpdateWatchEvent } from './use-watch-event-mutations';

const mocks = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('@/lib/axios-instance', () => ({ default: mocks }));
vi.mock('@/components/ui/toaster-store', () => ({ toaster: { success: vi.fn(), error: vi.fn() } }));

const identity = { mediaId: 12, mediaType: 'movie' as const };
const movie = {
  adult: false,
  backdrop_path: null,
  genre_ids: [],
  media_id: 12,
  media_type: 'movie' as const,
  original_language: 'en',
  original_title: 'Example',
  overview: '',
  popularity: 0,
  poster_path: null,
  release_date: '2026-09-01',
  runtime: 90,
  status: 'Released',
  title: 'Example',
  vote_average: 0,
  vote_count: 0,
  watched: true,
};
const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

const prepareUpcoming = (queryClient: QueryClient, watchlisted: () => boolean, watched: () => boolean) => {
  const key = upcomingQueryKeys.schedule({ from: '2026-09-01', to: '2026-10-01' });
  const readUpcoming = () => ({ data: watchlisted() ? [{ media_id: 12, watched: watched() }] : [] });
  queryClient.setQueryData(key, readUpcoming());
  const observer = new QueryObserver(queryClient, { queryKey: key, queryFn: readUpcoming });
  return { key, unsubscribe: observer.subscribe(() => undefined) };
};

describe('watch-event Upcoming reconciliation', () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.patch.mockReset();
    mocks.delete.mockReset();
  });

  it.each([false, true])('refreshes movie Upcoming after creating a watch with retention %s', async (retainWatchlist) => {
    let watchlisted = true;
    let watched = false;
    mocks.post.mockImplementation(async () => {
      watchlisted = retainWatchlist;
      watched = true;
      return { data: { data: { watchCount: 1, events: [] } } };
    });
    const queryClient = new QueryClient();
    const { key, unsubscribe } = prepareUpcoming(queryClient, () => watchlisted, () => watched);
    const { result } = renderHook(() => useCreateWatchEvent(identity), { wrapper: createWrapper(queryClient) });

    try {
      await act(() => result.current.mutateAsync({ ...movie, watchedOn: '2026-09-26', note: null, clientRequestId: 'request-1' }));
      expect(queryClient.getQueryData(key)).toEqual({ data: retainWatchlist ? [{ media_id: 12, watched: true }] : [] });
    } finally {
      unsubscribe();
    }
  });

  it.each([false, true])('refreshes movie Upcoming after deleting the last watch with retention %s', async (retainWatchlist) => {
    let watched = true;
    mocks.delete.mockImplementation(async () => {
      watched = false;
      return { data: { data: { watchCount: 0, events: [] } } };
    });
    const queryClient = new QueryClient();
    const { key, unsubscribe } = prepareUpcoming(queryClient, () => retainWatchlist, () => watched);
    const { result } = renderHook(() => useDeleteWatchEvent(identity), { wrapper: createWrapper(queryClient) });

    try {
      await act(() => result.current.mutateAsync('event-1'));
      expect(queryClient.getQueryData(key)).toEqual({ data: retainWatchlist ? [{ media_id: 12, watched: false }] : [] });
    } finally {
      unsubscribe();
    }
  });

  it('does not refetch Upcoming when only a watch date or note changes', async () => {
    mocks.patch.mockResolvedValue({ data: { data: { watchCount: 1, events: [] } } });
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateWatchEvent(identity), { wrapper: createWrapper(queryClient) });

    await act(() => result.current.mutateAsync({ eventId: 'event-1', payload: { watchedOn: '2026-09-26', note: null } }));

    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
  });
});
