import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/lib/axiosInstance', () => ({ default: api }));

import { AppError } from '@/lib/http';
import { fetchMediaDetails } from '@/features/media/tmdb.client';
import {
  flushProviderUsageMetrics,
  getProviderUsageReport,
  resetProviderUsageBufferForTests,
} from '@/features/provider-usage/provider-usage.service';

describe('TMDB client provider usage instrumentation', () => {
  beforeEach(() => {
    api.get.mockReset();
    resetProviderUsageBufferForTests();
  });

  it('records one outbound request and a cache hit for repeated calls', async () => {
    api.get.mockResolvedValue({ status: 200, data: { id: 901001 } });

    await fetchMediaDetails('movie', 901001);
    await fetchMediaDetails('movie', 901001);

    expect(api.get).toHaveBeenCalledTimes(1);

    await flushProviderUsageMetrics();
    const report = await getProviderUsageReport({
      from: new Date(Date.now() - 10 * 60_000),
      to: new Date(Date.now() + 60_000),
      provider: 'tmdb',
      operation: 'movie-details',
    });

    expect(report.summary).toMatchObject({ requestCount: 1, cacheHitCount: 1 });
  });

  it('records in-flight deduplication as a cache hit', async () => {
    let resolveResponse!: (response: { status: number; data: { id: number } }) => void;
    const response = new Promise<{ status: number; data: { id: number } }>((resolve) => {
      resolveResponse = resolve;
    });
    api.get.mockReturnValue(response);

    const first = fetchMediaDetails('movie', 902002);
    const second = fetchMediaDetails('movie', 902002);
    resolveResponse({ status: 200, data: { id: 902002 } });

    await Promise.all([first, second]);

    expect(api.get).toHaveBeenCalledTimes(1);

    await flushProviderUsageMetrics();
    const report = await getProviderUsageReport({
      from: new Date(Date.now() - 10 * 60_000),
      to: new Date(Date.now() + 60_000),
      provider: 'tmdb',
      operation: 'movie-details',
    });

    expect(report.summary).toMatchObject({ requestCount: 1, cacheHitCount: 1 });
  });

  it('records and rethrows translated 429 errors', async () => {
    const error = new AppError('Rate limited', { statusCode: 429 });
    api.get.mockRejectedValue(error);

    await expect(fetchMediaDetails('movie', 903003)).rejects.toBe(error);

    await flushProviderUsageMetrics();
    const report = await getProviderUsageReport({
      from: new Date(Date.now() - 10 * 60_000),
      to: new Date(Date.now() + 60_000),
      provider: 'tmdb',
      operation: 'movie-details',
    });

    expect(report.summary).toMatchObject({ requestCount: 1, errorCount: 1, rateLimitedCount: 1 });
  });
});
