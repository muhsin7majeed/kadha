import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';
import type { TrackingPreferences } from '../user-media.types';
import useTrackingPreferences from './use-tracking-preferences';
import useUpdateTrackingPreferences from './use-update-tracking-preferences';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: mocks.get,
    put: mocks.put,
  },
}));
vi.mock('@/hooks/use-error-handler', () => ({ useErrorHandler: mocks.error }));

const preferences: TrackingPreferences = {
  version: 1,
  keepWatchedOnWatchlist: false,
  hideCaughtUpWithoutScheduledNext: false,
};

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('tracking preference hooks', () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.put.mockReset();
    mocks.error.mockReset();
  });

  it('loads tracking preferences into their account-scoped cache key', async () => {
    mocks.get.mockResolvedValue({ data: { data: preferences } });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTrackingPreferences(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual(preferences));

    expect(mocks.get).toHaveBeenCalledWith('/api/user-media/tracking-preferences');
    expect(queryClient.getQueryData(queryKeys.trackingPreferences)).toEqual(preferences);
  });

  it('stores an updated preference and refetches Continue Watching when its filter changes', async () => {
    const updated: TrackingPreferences = {
      ...preferences,
      hideCaughtUpWithoutScheduledNext: true,
    };
    mocks.put.mockResolvedValue({ data: { data: updated } });
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.trackingPreferences, preferences);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const { result } = renderHook(() => useUpdateTrackingPreferences(), {
      wrapper: createWrapper(queryClient),
    });

    await act(() => result.current.mutateAsync(updated));

    expect(mocks.put).toHaveBeenCalledWith('/api/user-media/tracking-preferences', updated);
    expect(queryClient.getQueryData(queryKeys.trackingPreferences)).toEqual(updated);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });

  it('keeps saved preferences unchanged and reports a failed save', async () => {
    mocks.put.mockRejectedValue(new Error('Could not save'));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(queryKeys.trackingPreferences, preferences);
    const { result } = renderHook(() => useUpdateTrackingPreferences(), { wrapper: createWrapper(queryClient) });

    act(() => result.current.mutate({ ...preferences, keepWatchedOnWatchlist: true }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mocks.error).toHaveBeenCalledOnce();
    expect(mocks.error.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(queryClient.getQueryData(queryKeys.trackingPreferences)).toEqual(preferences);
  });

  it('does not refetch Continue Watching when only watchlist retention changes', async () => {
    const updated: TrackingPreferences = {
      ...preferences,
      keepWatchedOnWatchlist: true,
    };
    mocks.put.mockResolvedValue({ data: { data: updated } });
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.trackingPreferences, preferences);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const { result } = renderHook(() => useUpdateTrackingPreferences(), {
      wrapper: createWrapper(queryClient),
    });

    await act(() => result.current.mutateAsync(updated));

    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });
});
