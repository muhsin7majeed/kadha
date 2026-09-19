import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';
import { defaultOwnerMediaQuery } from './use-owner-media-query';
import useLiked from './use-liked';
import useWatched from './use-watched';
import useWatchList from './use-watch-list';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/lib/axios-instance', () => ({ default: { get: mocks.get } }));

const response = {
  data: {
    data: [],
    access: { canView: true },
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    facets: { total: 0, genres: [], years: { min: null, max: null } },
  },
};

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('owner media list hooks', () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.get.mockResolvedValue(response);
  });

  it('sends normalized owner criteria and keeps keys below existing invalidation roots', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = createWrapper(queryClient);
    const ownerQuery = {
      ...defaultOwnerMediaQuery,
      page: 2,
      query: 'arrival',
      mediaType: 'movie' as const,
      genres: [12, 18],
      rating: 8,
      sort: 'title' as const,
      order: 'asc' as const,
    };

    renderHook(() => useLiked(undefined, { ownerQuery }), { wrapper });
    renderHook(() => useWatched(undefined, { ownerQuery }), { wrapper });
    renderHook(() => useWatchList(undefined, { ownerQuery }), { wrapper });

    await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(3));
    const expectedParams = {
      page: 2,
      query: 'arrival',
      mediaType: 'movie',
      genres: '12,18',
      yearFrom: undefined,
      yearTo: undefined,
      rating: 8,
      sort: 'title',
      order: 'asc',
    };
    expect(mocks.get).toHaveBeenCalledWith('/api/user/liked', { params: expectedParams });
    expect(mocks.get).toHaveBeenCalledWith('/api/user/watched', { params: expectedParams });
    expect(mocks.get).toHaveBeenCalledWith('/api/user/watchlist', { params: expectedParams });
    expect(queryClient.getQueryCache().find({ queryKey: queryKeys.likedList(ownerQuery) })).toBeDefined();
    expect(queryClient.getQueryCache().find({ queryKey: queryKeys.watchedList(ownerQuery) })).toBeDefined();
    expect(queryClient.getQueryCache().find({ queryKey: queryKeys.watchListList(ownerQuery) })).toBeDefined();
  });

  it('keeps public profile requests page-only', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = createWrapper(queryClient);

    renderHook(() => useLiked('alice', { page: 3 }), { wrapper });
    renderHook(() => useWatched('alice', { page: 3 }), { wrapper });
    renderHook(() => useWatchList('alice', { page: 3 }), { wrapper });

    await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(3));
    expect(mocks.get).toHaveBeenCalledWith('/api/public/users/alice/liked', { params: { page: 3 } });
    expect(mocks.get).toHaveBeenCalledWith('/api/public/users/alice/watched', { params: { page: 3 } });
    expect(mocks.get).toHaveBeenCalledWith('/api/public/users/alice/watchlist', { params: { page: 3 } });
  });
});
