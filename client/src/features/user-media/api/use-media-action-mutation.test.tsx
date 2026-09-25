import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import type { TrackingPreferences, UserMediaPayload } from '../user-media.types';
import useAddToLiked from './use-add-to-liked';
import useAddToWatched from './use-add-to-watched';
import useAddToWatchList from './use-add-to-watch-list';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/lib/axios-instance', () => ({ default: { post: mocks.post } }));
vi.mock('@/components/ui/toaster-store', () => ({
  toaster: { success: vi.fn(), error: vi.fn() },
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

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

const saved = { data: { message: 'Saved' } };

describe('useMediaActionMutation preference cache handling', () => {
  beforeEach(() => {
    mocks.post.mockReset();
  });

  it('settles an active initial Continue Watching load after a watchlist action', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const key = queryKeys.inProgressTv();
    const initial = deferred<{ data: Array<{ media_id: number; media_type: string; watchlist: boolean }> }>();
    const serverData = { data: [{ media_id: 41, media_type: 'tv', watchlist: true }] };
    const queryFn = vi.fn().mockReturnValueOnce(initial.promise).mockResolvedValue(serverData);
    const observer = new QueryObserver(queryClient, { queryKey: key, queryFn });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    try {
      await act(() => result.current.mutateAsync({ ...payload, watchlist: true }));
      initial.resolve(serverData);
      await waitFor(() => expect(queryClient.getQueryData(key)).toEqual(serverData));
      expect(queryClient.getQueryState(key)?.status).toBe('success');
    } finally {
      unsubscribe();
    }
  });

  it('does not abandon an unrelated active details request', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const key = queryKeys.mediaDetailsById('movie', '22');
    const initial = deferred<{ media_id: number; media_type: string; title: string }>();
    const serverData = { media_id: 22, media_type: 'movie', title: 'Other movie' };
    const queryFn = vi.fn().mockReturnValue(initial.promise);
    const observer = new QueryObserver(queryClient, { queryKey: key, queryFn });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    try {
      await act(() => result.current.mutateAsync({ ...payload, watchlist: true }));
      initial.resolve(serverData);
      await waitFor(() => expect(queryClient.getQueryData(key)).toEqual(serverData));
    } finally {
      unsubscribe();
    }
  });

  it('keeps refreshed progress and the new flag after an active background request', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const key = queryKeys.inProgressTv();
    const initial = deferred<{ data: Array<{ media_id: number; media_type: string; watchlist: boolean; watchedEpisodeCount: number }> }>();
    const oldData = { data: [{ media_id: 41, media_type: 'tv', watchlist: false, watchedEpisodeCount: 1 }] };
    const serverData = { data: [{ media_id: 41, media_type: 'tv', watchlist: true, watchedEpisodeCount: 2 }] };
    queryClient.setQueryData(key, oldData);
    const queryFn = vi.fn().mockReturnValueOnce(initial.promise).mockResolvedValue(serverData);
    const observer = new QueryObserver(queryClient, { queryKey: key, queryFn });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    try {
      await act(() => result.current.mutateAsync({ ...payload, watchlist: true }));
      initial.resolve({ data: [{ ...oldData.data[0], watchedEpisodeCount: 2 }] });
      await waitFor(() => expect(queryClient.getQueryData(key)).toEqual(serverData));
    } finally {
      unsubscribe();
    }
  });

  it.each([41, 42])('does not undo a successful watchlist toggle when a concurrent Like fails for title %i', async (watchlistId) => {
    const like = deferred<typeof saved>();
    const watchlist = deferred<typeof saved>();
    mocks.post.mockImplementation((url: string) => url.endsWith('/liked') ? like.promise : watchlist.promise);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: [41, 42].map((media_id) => ({ media_id, media_type: 'tv', liked: false, watchlist: false })) });
    const { result } = renderHook(() => ({ like: useAddToLiked(), watchlist: useAddToWatchList() }), {
      wrapper: createWrapper(queryClient),
    });
    let pendingLike!: Promise<unknown>;
    let pendingWatchlist!: Promise<unknown>;
    act(() => { pendingLike = result.current.like.mutateAsync({ ...payload, liked: true }).catch(() => undefined); });
    await waitFor(() => expect(queryClient.getQueryData<{ data: Array<{ liked: boolean }> }>(key)?.data[0].liked).toBe(true));
    act(() => { pendingWatchlist = result.current.watchlist.mutateAsync({ ...payload, media_id: watchlistId, watchlist: true }); });
    await waitFor(() => expect(queryClient.getQueryData<{ data: Array<{ watchlist: boolean }> }>(key)?.data.find((item) => item.watchlist)).toBeDefined());
    await act(async () => { watchlist.resolve(saved); await pendingWatchlist; });
    await act(async () => { like.reject(new Error('Like failed')); await pendingLike; });

    expect(queryClient.getQueryData<{ data: Array<{ media_id: number; liked: boolean; watchlist: boolean }> }>(key)?.data)
      .toMatchObject([
        { media_id: 41, liked: false, watchlist: watchlistId === 41 },
        { media_id: 42, liked: false, watchlist: watchlistId === 42 },
      ]);
  });

  it('keeps a later pending watchlist toggle after an earlier Like fails', async () => {
    const like = deferred<typeof saved>();
    const watchlist = deferred<typeof saved>();
    mocks.post.mockImplementation((url: string) => url.endsWith('/liked') ? like.promise : watchlist.promise);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: [{ media_id: 41, media_type: 'tv', liked: false, watchlist: false }] });
    const { result } = renderHook(() => ({ like: useAddToLiked(), watchlist: useAddToWatchList() }), {
      wrapper: createWrapper(queryClient),
    });
    let pendingLike!: Promise<unknown>;
    let pendingWatchlist!: Promise<unknown>;
    act(() => { pendingLike = result.current.like.mutateAsync({ ...payload, liked: true }).catch(() => undefined); });
    await waitFor(() => expect(queryClient.getQueryData<{ data: Array<{ liked: boolean }> }>(key)?.data[0].liked).toBe(true));
    act(() => { pendingWatchlist = result.current.watchlist.mutateAsync({ ...payload, watchlist: true }); });
    await waitFor(() => expect(queryClient.getQueryData<{ data: Array<{ watchlist: boolean }> }>(key)?.data[0].watchlist).toBe(true));
    await act(async () => { like.reject(new Error('Like failed')); await pendingLike; });
    await act(async () => { watchlist.resolve(saved); await pendingWatchlist; });

    expect(queryClient.getQueryData<{ data: Array<{ liked: boolean; watchlist: boolean }> }>(key)?.data[0])
      .toMatchObject({ liked: false, watchlist: true });
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
