import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpcomingResponse } from '@/features/upcoming/upcoming.types';
import { upcomingQueryKeys } from '@/lib/query-keys';
import { useUpcomingWindows } from './use-upcoming';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/lib/axios-instance', () => ({ default: { get: mocks.get } }));

const createResponse = (date: string, title: string, mediaId: number, failedTitles = 0): UpcomingResponse => ({
  entries: [
    {
      kind: 'movie-release',
      date,
      media: {
        adult: false,
        backdrop_path: null,
        genre_ids: [],
        media_id: mediaId,
        media_type: 'movie',
        original_language: 'en',
        original_title: title,
        overview: null,
        popularity: 1,
        poster_path: null,
        release_date: date,
        title,
        vote_average: 7,
        vote_count: 10,
      },
      watched: false,
    },
  ],
  coverage: {
    trackedTitles: 2,
    resolvedTitles: 2 - failedTitles,
    failedTitles,
  },
});

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useUpcomingWindows', () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.get.mockImplementation((_, config: { params: { from: string } }) =>
      Promise.resolve({
        data: {
          data:
            config.params.from === '2026-08-01'
              ? createResponse('2026-08-25', 'Past film', 1)
              : createResponse('2026-09-25', 'Future film', 2, 1),
        },
      }),
    );
  });

  it('loads bounded windows, merges entries chronologically, and retains conservative coverage', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const ranges = [
      { from: '2026-08-01', to: '2026-08-31' },
      { from: '2026-09-01', to: '2026-09-30' },
    ];
    const { result } = renderHook(() => useUpcomingWindows(ranges), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data?.entries).toHaveLength(2));

    expect(result.current.data?.entries.map((entry) => entry.date)).toEqual(['2026-08-25', '2026-09-25']);
    expect(result.current.data?.coverage).toEqual({
      trackedTitles: 2,
      resolvedTitles: 1,
      failedTitles: 1,
    });
    expect(mocks.get).toHaveBeenCalledWith('/api/upcoming', { params: ranges[0] });
    expect(mocks.get).toHaveBeenCalledWith('/api/upcoming', { params: ranges[1] });
  });

  it('keeps loaded windows in the Upcoming query cache for navigation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const range = { from: '2026-09-01', to: '2026-09-30' };

    renderHook(() => useUpcomingWindows([range]), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(queryClient.getQueryData(upcomingQueryKeys.schedule(range))).toBeDefined());

    const query = queryClient.getQueryCache().find({ queryKey: upcomingQueryKeys.schedule(range) });
    expect(query?.options.staleTime).toBe(5 * 60 * 1000);
    expect(query?.options.gcTime).toBe(30 * 60 * 1000);
  });
});
