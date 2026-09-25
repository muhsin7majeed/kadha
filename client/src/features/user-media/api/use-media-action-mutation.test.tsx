import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import type { TrackingPreferences, UserMediaPayload } from '../user-media.types';
import useAddToWatched from './use-add-to-watched';
import useAddToWatchList from './use-add-to-watch-list';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/lib/axios-instance', () => ({ default: { post: mocks.post } }));
vi.mock('@/components/ui/toaster-store', () => ({
  toaster: { success: vi.fn() },
}));

const payload: UserMediaPayload = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [18],
  media_id: 41,
  media_type: 'tv',
  original_language: 'en',
  original_title: 'Example Show',
  overview: 'Overview',
  popularity: 10,
  poster_path: '/poster.jpg',
  release_date: '2025-01-01',
  runtime: 45,
  status: 'Returning Series',
  title: 'Example Show',
  vote_average: 8,
  vote_count: 100,
  watched: true,
  watchlist: true,
};

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useMediaActionMutation preference cache handling', () => {
  beforeEach(() => {
    mocks.post.mockReset();
  });

  it('prevents an older in-flight Continue Watching response from restoring stale flags', async () => {
    mocks.post.mockResolvedValue({ data: { message: 'tv added to watchlist' } });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
    const key = queryKeys.inProgressTv();
    const oldData = { access: { canView: true }, data: [{ media_id: 41, media_type: 'tv', watchlist: false }] };
    queryClient.setQueryData(key, oldData);
    let finish!: (data: typeof oldData) => void;
    void queryClient.fetchQuery({ queryKey: key, queryFn: () => new Promise<typeof oldData>((resolve) => { finish = resolve; }) }).catch(() => undefined);
    await waitFor(() => expect(queryClient.getQueryState(key)?.fetchStatus).toBe('fetching'));
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });
    await act(() => result.current.mutateAsync({ ...payload, watchlist: true }));
    await act(async () => { finish(oldData); await new Promise((resolve) => setTimeout(resolve, 0)); });
    expect(queryClient.getQueryState(key)?.fetchStatus).toBe('idle');
    expect(queryClient.getQueryData<typeof oldData>(key)?.data[0].watchlist).toBe(true);
  });

  it('still refreshes Upcoming when the previously cached TV episode tracking is invalidated', async () => {
    mocks.post.mockResolvedValue({ data: { message: 'tv added to watchlist' } });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(queryKeys.inProgressTv(), {
      access: { canView: true }, data: [{ media_id: 41, media_type: 'tv', watchlist: false }],
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.inProgressTvRoot, refetchType: 'none' });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    await act(() => result.current.mutateAsync({ ...payload, watchlist: true }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
  });

  it('uses a loaded default preference for optimistic watchlist clearing', async () => {
    let resolvePost: (value: { data: { message: string } }) => void = () => undefined;
    mocks.post.mockReturnValue(
      new Promise<{ data: { message: string } }>((resolve) => {
        resolvePost = resolve;
      }),
    );
    const preferences: TrackingPreferences = {
      version: 1,
      keepWatchedOnWatchlist: false,
      hideCaughtUpWithoutScheduledNext: false,
    };
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(queryKeys.trackingPreferences, preferences);
    queryClient.setQueryData(queryKeys.mediaDetailsById('tv', '41'), {
      media_id: 41,
      media_type: 'tv',
      watched: false,
      watchlist: true,
    });
    const { result } = renderHook(() => useAddToWatched(), { wrapper: createWrapper(queryClient) });

    act(() => result.current.mutate(payload));

    await waitFor(() =>
      expect(queryClient.getQueryData(queryKeys.mediaDetailsById('tv', '41'))).toMatchObject({
        watched: true,
        watchlist: false,
      }),
    );

    resolvePost({ data: { message: 'tv watched' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('keeps watchlist state optimistic and reconciles in-progress TV after success when preferences are absent', async () => {
    mocks.post.mockResolvedValue({ data: { message: 'tv watched' } });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(queryKeys.mediaDetailsById('tv', '41'), {
      media_id: 41,
      media_type: 'tv',
      watched: false,
      watchlist: true,
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAddToWatched(), { wrapper: createWrapper(queryClient) });

    await act(() => result.current.mutateAsync(payload));

    expect(queryClient.getQueryData(queryKeys.mediaDetailsById('tv', '41'))).toMatchObject({
      watched: true,
      watchlist: true,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });
});
