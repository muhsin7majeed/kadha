import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { requestWithProviderMetrics } from '@/features/provider-usage/provider-usage.client';
import {
  flushProviderUsageMetrics,
  getProviderUsageReport,
  recordProviderCacheHit,
  recordProviderRequest,
  resetProviderUsageBufferForTests,
} from '@/features/provider-usage/provider-usage.service';

describe('provider usage metrics', () => {
  it('aggregates requests and cache hits into a provider bucket', async () => {
    const now = new Date('2026-09-22T12:07:00.000Z');

    recordProviderRequest({ provider: 'tmdb', operation: 'movie-details', status: 200, durationMs: 41, now });
    recordProviderRequest({ provider: 'tmdb', operation: 'movie-details', status: 429, durationMs: 12, now });
    recordProviderCacheHit({ provider: 'tmdb', operation: 'movie-details', now });

    await flushProviderUsageMetrics(now);

    const bucket = await prisma.providerUsageBucket.findUnique({
      where: {
        provider_operation_bucketStart: {
          provider: 'tmdb',
          operation: 'movie-details',
          bucketStart: new Date('2026-09-22T12:05:00.000Z'),
        },
      },
    });

    expect(bucket).toMatchObject({
      requestCount: 2,
      successCount: 1,
      errorCount: 1,
      rateLimitedCount: 1,
      cacheHitCount: 1,
      totalDurationMs: 53,
    });

    resetProviderUsageBufferForTests();
  });

  it('records status codes after the provider client translates upstream errors', async () => {
    await expect(
      requestWithProviderMetrics('test-provider', 'translated-error', async () => {
        throw new AppError('Rate limited', { statusCode: 429 });
      }),
    ).rejects.toThrow('Rate limited');

    await flushProviderUsageMetrics();

    const bucket = await prisma.providerUsageBucket.findFirst({
      where: { provider: 'test-provider', operation: 'translated-error' },
      orderBy: { bucketStart: 'desc' },
    });

    expect(bucket).toMatchObject({ requestCount: 1, errorCount: 1, rateLimitedCount: 1 });
  });

  it('returns an aggregated report by time bucket and operation', async () => {
    const firstBucket = new Date('2026-09-22T12:05:00.000Z');
    const secondBucket = new Date('2026-09-22T12:10:00.000Z');

    await prisma.providerUsageBucket.createMany({
      data: [
        {
          provider: 'tmdb',
          operation: 'movie-search',
          bucketStart: firstBucket,
          requestCount: 4,
          successCount: 4,
          errorCount: 0,
          rateLimitedCount: 0,
          cacheHitCount: 2,
          totalDurationMs: 100,
        },
        {
          provider: 'tmdb',
          operation: 'movie-details',
          bucketStart: secondBucket,
          requestCount: 2,
          successCount: 1,
          errorCount: 1,
          rateLimitedCount: 1,
          cacheHitCount: 0,
          totalDurationMs: 80,
        },
      ],
    });

    const report = await getProviderUsageReport({
      from: new Date('2026-09-22T12:00:00.000Z'),
      to: new Date('2026-09-22T12:15:00.000Z'),
      provider: 'tmdb',
    });

    expect(report.summary).toMatchObject({
      requestCount: 6,
      successCount: 5,
      errorCount: 1,
      rateLimitedCount: 1,
      cacheHitCount: 2,
      totalDurationMs: 180,
      averageDurationMs: 30,
    });
    expect(report.series).toHaveLength(2);
    expect(report.operations.map(({ operation }) => operation)).toEqual(['movie-search', 'movie-details']);
  });
});
