import { useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { UpcomingRange, UpcomingResponse } from '@/features/upcoming/upcoming.types';
import api from '@/lib/axios-instance';
import { upcomingQueryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';

const UPCOMING_STALE_TIME_MS = 5 * 60 * 1000;
const UPCOMING_GC_TIME_MS = 30 * 60 * 1000;

export interface UpcomingQueryOptions {
  enabled?: boolean;
}

const fetchUpcoming = async (range: UpcomingRange) => {
  const response = await api.get<BaseResponse<UpcomingResponse>>('/api/upcoming', { params: range });
  return response.data.data;
};

const upcomingQueryOptions = (range: UpcomingRange, enabled = true) => ({
  queryKey: upcomingQueryKeys.schedule(range),
  queryFn: () => fetchUpcoming(range),
  enabled,
  staleTime: UPCOMING_STALE_TIME_MS,
  gcTime: UPCOMING_GC_TIME_MS,
});

const entryKey = (entry: UpcomingResponse['entries'][number]) =>
  `${entry.kind}:${entry.media.media_type}:${entry.media.media_id}:${entry.date}`;

const mergeUpcomingResponses = (responses: UpcomingResponse[]): UpcomingResponse => {
  const entries = new Map<string, UpcomingResponse['entries'][number]>();

  for (const response of responses) {
    for (const entry of response.entries) {
      entries.set(entryKey(entry), entry);
    }
  }

  const trackedTitles = Math.max(...responses.map((response) => response.coverage.trackedTitles));
  const failedTitles = Math.max(...responses.map((response) => response.coverage.failedTitles));

  return {
    entries: [...entries.values()].sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        left.media.media_type.localeCompare(right.media.media_type) ||
        left.media.media_id - right.media.media_id,
    ),
    coverage: {
      trackedTitles,
      failedTitles,
      resolvedTitles: Math.max(trackedTitles - failedTitles, 0),
    },
  };
};

const useUpcoming = (range: UpcomingRange, options: UpcomingQueryOptions = {}) =>
  useQuery(upcomingQueryOptions(range, options.enabled ?? true));

export interface UpcomingWindowsResult {
  data?: UpcomingResponse;
  error: Error | null;
  hasRangeError: boolean;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown[]>;
}

export const useUpcomingWindows = (
  ranges: UpcomingRange[],
  options: UpcomingQueryOptions = {},
): UpcomingWindowsResult => {
  const enabled = options.enabled ?? true;
  const results = useQueries({
    queries: ranges.map((range) => upcomingQueryOptions(range, enabled)),
  });
  const responses = results
    .map((result) => result.data)
    .filter((data): data is UpcomingResponse => Boolean(data));
  const hasRangeError = enabled && results.some((result) => result.isError);
  const error = results.find((result): result is UseQueryResult<UpcomingResponse, Error> => result.isError)?.error ?? null;

  return {
    data: responses.length > 0 ? mergeUpcomingResponses(responses) : undefined,
    error,
    hasRangeError,
    isError: enabled && responses.length === 0 && hasRangeError,
    isFetching: enabled && results.some((result) => result.isFetching),
    isLoading: enabled && responses.length === 0 && results.some((result) => result.isLoading),
    refetch: () => Promise.all(results.map((result) => result.refetch())),
  };
};

export default useUpcoming;
