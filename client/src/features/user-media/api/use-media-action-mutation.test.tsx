import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';
import type { UserMediaPayload } from '../user-media.types';
import useAddToLiked from './use-add-to-liked';
import useAddToWatched from './use-add-to-watched';
import useAddToWatchList from './use-add-to-watch-list';

const mocks = vi.hoisted(() => ({ post: vi.fn(), error: vi.fn() }));

vi.mock('@/lib/axios-instance', () => ({ default: { post: mocks.post } }));
vi.mock('@/components/ui/toaster-store', () => ({ toaster: { success: vi.fn(), error: mocks.error } }));

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

const saved = { data: { message: 'Saved' } };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
const createClient = () => new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });

describe('media action query settlement', () => {
  beforeEach(() => { mocks.post.mockReset(); mocks.error.mockReset(); });

  it('keeps cached flags unchanged while pending, then refreshes Continue Watching after success', async () => {
    const post = deferred<typeof saved>();
    mocks.post.mockReturnValue(post.promise);
    const queryClient = createClient();
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: [{ media_id: 41, media_type: 'tv', watchlist: false }] });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    act(() => result.current.mutate({ ...payload, watchlist: true }));
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(queryClient.getQueryData<{ data: Array<{ watchlist: boolean }> }>(key)?.data[0].watchlist).toBe(false);

    act(() => post.resolve(saved));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });

  it('does not change cached flags or strand reads when the action fails', async () => {
    const post = deferred<typeof saved>();
    mocks.post.mockReturnValue(post.promise);
    const queryClient = createClient();
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: [{ media_id: 41, media_type: 'tv', watchlist: false }] });
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync({ ...payload, watchlist: true }).catch(() => undefined); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    await act(async () => { post.reject(new Error('Unavailable')); await pending; });
    await waitFor(() => expect(mocks.error).toHaveBeenCalledOnce());

    expect(queryClient.getQueryData<{ data: Array<{ watchlist: boolean }> }>(key)?.data[0].watchlist).toBe(false);
  });

  it('settles an active initial Continue Watching load after a watchlist action', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = createClient();
    const key = queryKeys.inProgressTv();
    const initial = deferred<{ data: Array<{ media_id: number; media_type: string; watchlist: boolean }> }>();
    const serverData = { data: [{ media_id: 41, media_type: 'tv', watchlist: true }] };
    const queryFn = vi.fn().mockReturnValueOnce(initial.promise).mockResolvedValue(serverData);
    const observer = new QueryObserver(queryClient, { queryKey: key, queryFn });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => useAddToWatchList(), { wrapper: createWrapper(queryClient) });

    try {
      let pending!: Promise<unknown>;
      act(() => { pending = result.current.mutateAsync({ ...payload, watchlist: true }); });
      await pending;
      initial.resolve(serverData);
      await waitFor(() => expect(queryClient.getQueryData(key)).toEqual(serverData));
      expect(queryClient.getQueryState(key)?.status).toBe('success');
    } finally {
      unsubscribe();
    }
  });

  it('does not abandon an unrelated active details request', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = createClient();
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

  it('refreshes progress and flags after an active background request', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = createClient();
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
      let pending!: Promise<unknown>;
      act(() => { pending = result.current.mutateAsync({ ...payload, watchlist: true }); });
      await pending;
      initial.resolve({ data: [{ ...oldData.data[0], watchedEpisodeCount: 2 }] });
      await waitFor(() => expect(queryClient.getQueryData(key)).toEqual(serverData));
    } finally {
      unsubscribe();
    }
  });

  it.each([41, 42])('reconciles title %i after a concurrent Like fails and Watchlist succeeds', async (watchlistId) => {
    const like = deferred<typeof saved>();
    const watchlist = deferred<typeof saved>();
    const serverRows = [41, 42].map((media_id) => ({ media_id, media_type: 'tv', liked: false, watchlist: false }));
    mocks.post.mockImplementation((url: string) => (url.endsWith('/liked') ? like.promise : watchlist.promise)
      .then((response) => {
        if (url.endsWith('/watchlist')) serverRows.find((row) => row.media_id === watchlistId)!.watchlist = true;
        return response;
      }));
    const queryClient = createClient();
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: serverRows.map((row) => ({ ...row })) });
    const observer = new QueryObserver(queryClient, {
      queryKey: key,
      queryFn: () => Promise.resolve({ data: serverRows.map((row) => ({ ...row })) }),
    });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => ({ like: useAddToLiked(), watchlist: useAddToWatchList() }), {
      wrapper: createWrapper(queryClient),
    });
    let pendingLike!: Promise<unknown>;
    let pendingWatchlist!: Promise<unknown>;

    try {
      act(() => { pendingLike = result.current.like.mutateAsync({ ...payload, liked: true }).catch(() => undefined); });
      act(() => { pendingWatchlist = result.current.watchlist.mutateAsync({ ...payload, media_id: watchlistId, watchlist: true }); });
      await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(2));
      await act(async () => { watchlist.resolve(saved); await pendingWatchlist; });
      await act(async () => { like.reject(new Error('Like failed')); await pendingLike; });

      expect(queryClient.getQueryData<{ data: typeof serverRows }>(key)?.data).toMatchObject([
        { media_id: 41, liked: false, watchlist: watchlistId === 41 },
        { media_id: 42, liked: false, watchlist: watchlistId === 42 },
      ]);
    } finally {
      unsubscribe();
    }
  });

  it('reconciles a later Watchlist success after an earlier Like fails', async () => {
    const like = deferred<typeof saved>();
    const watchlist = deferred<typeof saved>();
    let watchlisted = false;
    mocks.post.mockImplementation((url: string) => (url.endsWith('/liked') ? like.promise : watchlist.promise)
      .then((response) => { if (url.endsWith('/watchlist')) watchlisted = true; return response; }));
    const queryClient = createClient();
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: [{ media_id: 41, media_type: 'tv', liked: false, watchlist: false }] });
    const observer = new QueryObserver(queryClient, {
      queryKey: key,
      queryFn: () => Promise.resolve({ data: [{ media_id: 41, media_type: 'tv', liked: false, watchlist: watchlisted }] }),
    });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => ({ like: useAddToLiked(), watchlist: useAddToWatchList() }), {
      wrapper: createWrapper(queryClient),
    });
    let pendingLike!: Promise<unknown>;
    let pendingWatchlist!: Promise<unknown>;

    try {
      act(() => { pendingLike = result.current.like.mutateAsync({ ...payload, liked: true }).catch(() => undefined); });
      act(() => { pendingWatchlist = result.current.watchlist.mutateAsync({ ...payload, watchlist: true }); });
      await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(2));
      await act(async () => { like.reject(new Error('Like failed')); await pendingLike; });
      await act(async () => { watchlist.resolve(saved); await pendingWatchlist; });
      expect(queryClient.getQueryData<{ data: Array<{ liked: boolean; watchlist: boolean }> }>(key)?.data[0])
        .toMatchObject({ liked: false, watchlist: true });
    } finally {
      unsubscribe();
    }
  });

  it('does not trust invalidated preferences after an import: watched state comes from refetch', async () => {
    mocks.post.mockResolvedValue(saved);
    const queryClient = createClient();
    queryClient.setQueryData(queryKeys.trackingPreferences, {
      version: 1, keepWatchedOnWatchlist: true, hideCaughtUpWithoutScheduledNext: false,
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.trackingPreferences, refetchType: 'none' });
    const key = queryKeys.inProgressTv();
    queryClient.setQueryData(key, { data: [{ media_id: 41, media_type: 'tv', watched: false, watchlist: true }] });
    const observer = new QueryObserver(queryClient, {
      queryKey: key,
      queryFn: () => Promise.resolve({ data: [{ media_id: 41, media_type: 'tv', watched: true, watchlist: false }] }),
    });
    const unsubscribe = observer.subscribe(() => undefined);
    const { result } = renderHook(() => useAddToWatched(), { wrapper: createWrapper(queryClient) });

    try {
      await act(() => result.current.mutateAsync({ ...payload, watched: true }));
      expect(queryClient.getQueryData<{ data: Array<{ watched: boolean; watchlist: boolean }> }>(key)?.data[0])
        .toMatchObject({ watched: true, watchlist: false });
    } finally {
      unsubscribe();
    }
  });
});
