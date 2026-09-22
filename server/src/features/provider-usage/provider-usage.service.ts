import { prisma } from '@/lib/prisma';
import type {
  ProviderUsageOperation,
  ProviderUsageQuery,
  ProviderUsageReport,
  ProviderUsageSeriesPoint,
  ProviderUsageSummary,
} from './provider-usage.types';

const BUCKET_MINUTES = 5;
const RETENTION_DAYS = 90;
const FLUSH_INTERVAL_MS = 30_000;
const RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface PendingUsage {
  provider: string;
  operation: string;
  bucketStart: Date;
  requestCount: number;
  successCount: number;
  errorCount: number;
  rateLimitedCount: number;
  cacheHitCount: number;
  totalDurationMs: number;
}

const pendingUsage = new Map<string, PendingUsage>();
let flushTimer: NodeJS.Timeout | undefined;

const getBucketStart = (date: Date) => {
  const bucket = new Date(date);
  bucket.setUTCSeconds(0, 0);
  bucket.setUTCMinutes(Math.floor(bucket.getUTCMinutes() / BUCKET_MINUTES) * BUCKET_MINUTES);
  return bucket;
};

const getUsageKey = (provider: string, operation: string, bucketStart: Date) =>
  `${provider}\u0000${operation}\u0000${bucketStart.toISOString()}`;

const getOrCreatePendingUsage = (provider: string, operation: string, now: Date) => {
  const bucketStart = getBucketStart(now);
  const key = getUsageKey(provider, operation, bucketStart);
  const existing = pendingUsage.get(key);

  if (existing) return existing;

  const usage: PendingUsage = {
    provider,
    operation,
    bucketStart,
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    rateLimitedCount: 0,
    cacheHitCount: 0,
    totalDurationMs: 0,
  };

  pendingUsage.set(key, usage);
  return usage;
};

export const recordProviderRequest = ({
  provider,
  operation,
  status,
  durationMs,
  now = new Date(),
}: {
  provider: string;
  operation: string;
  status?: number;
  durationMs: number;
  now?: Date;
}) => {
  const usage = getOrCreatePendingUsage(provider, operation, now);
  usage.requestCount += 1;
  usage.totalDurationMs += Math.max(0, Math.round(durationMs));

  if (status !== undefined && status >= 200 && status < 300) {
    usage.successCount += 1;
  } else {
    usage.errorCount += 1;
  }

  if (status === 429) {
    usage.rateLimitedCount += 1;
  }
};

export const recordProviderCacheHit = ({
  provider,
  operation,
  now = new Date(),
}: {
  provider: string;
  operation: string;
  now?: Date;
}) => {
  const usage = getOrCreatePendingUsage(provider, operation, now);
  usage.cacheHitCount += 1;
};

const mergeUsage = (target: PendingUsage, source: PendingUsage) => {
  target.requestCount += source.requestCount;
  target.successCount += source.successCount;
  target.errorCount += source.errorCount;
  target.rateLimitedCount += source.rateLimitedCount;
  target.cacheHitCount += source.cacheHitCount;
  target.totalDurationMs += source.totalDurationMs;
};

export const pruneProviderUsageMetrics = async (now = new Date()) => {
  const retentionDate = new Date(now);
  retentionDate.setUTCDate(retentionDate.getUTCDate() - RETENTION_DAYS);

  try {
    await prisma.providerUsageBucket.deleteMany({ where: { bucketStart: { lt: retentionDate } } });
  } catch (error) {
    console.error('Failed to prune provider usage metrics', error);
  }
};

export const flushProviderUsageMetrics = async () => {
  if (pendingUsage.size === 0) return;

  const entries = [...pendingUsage.values()];
  pendingUsage.clear();

  try {
    await prisma.$transaction([
      ...entries.map((entry) =>
        prisma.providerUsageBucket.upsert({
          where: {
            provider_operation_bucketStart: {
              provider: entry.provider,
              operation: entry.operation,
              bucketStart: entry.bucketStart,
            },
          },
          create: entry,
          update: {
            requestCount: { increment: entry.requestCount },
            successCount: { increment: entry.successCount },
            errorCount: { increment: entry.errorCount },
            rateLimitedCount: { increment: entry.rateLimitedCount },
            cacheHitCount: { increment: entry.cacheHitCount },
            totalDurationMs: { increment: entry.totalDurationMs },
          },
        }),
      ),
    ]);
  } catch (error) {
    entries.forEach((entry) => {
      const existing = pendingUsage.get(getUsageKey(entry.provider, entry.operation, entry.bucketStart));

      if (existing) {
        mergeUsage(existing, entry);
      } else {
        pendingUsage.set(getUsageKey(entry.provider, entry.operation, entry.bucketStart), entry);
      }
    });

    console.error('Failed to flush provider usage metrics', error);
  }
};

export const startProviderUsageMetrics = () => {
  if (flushTimer) return;

  flushTimer = setInterval(() => {
    void flushProviderUsageMetrics();
  }, FLUSH_INTERVAL_MS);
  flushTimer.unref();

  void pruneProviderUsageMetrics();
  const retentionTimer = setInterval(() => {
    void pruneProviderUsageMetrics();
  }, RETENTION_INTERVAL_MS);
  retentionTimer.unref();
};

const emptySummary = (): ProviderUsageSummary => ({
  requestCount: 0,
  successCount: 0,
  errorCount: 0,
  rateLimitedCount: 0,
  cacheHitCount: 0,
  totalDurationMs: 0,
  averageDurationMs: 0,
  cacheHitRate: 0,
});

type ProviderUsageTotals = Pick<
  ProviderUsageSummary,
  'requestCount' | 'successCount' | 'errorCount' | 'rateLimitedCount' | 'cacheHitCount' | 'totalDurationMs'
>;

const addUsage = (summary: ProviderUsageSummary, bucket: ProviderUsageTotals) => {
  summary.requestCount += bucket.requestCount;
  summary.successCount += bucket.successCount;
  summary.errorCount += bucket.errorCount;
  summary.rateLimitedCount += bucket.rateLimitedCount;
  summary.cacheHitCount += bucket.cacheHitCount;
  summary.totalDurationMs += bucket.totalDurationMs;
};

const finalizeSummary = <T extends ProviderUsageSummary>(summary: T): T => {
  summary.averageDurationMs = summary.requestCount ? Math.round(summary.totalDurationMs / summary.requestCount) : 0;
  const totalAttempts = summary.requestCount + summary.cacheHitCount;
  summary.cacheHitRate = totalAttempts ? summary.cacheHitCount / totalAttempts : 0;
  return summary;
};

export const getProviderUsageReport = async ({
  from,
  to,
  provider,
  operation,
}: ProviderUsageQuery): Promise<ProviderUsageReport> => {
  const buckets = await prisma.providerUsageBucket.findMany({
    where: {
      bucketStart: { gte: from, lt: to },
      ...(provider ? { provider } : {}),
      ...(operation ? { operation } : {}),
    },
    orderBy: [{ bucketStart: 'asc' }, { provider: 'asc' }, { operation: 'asc' }],
  });

  const summary = emptySummary();
  const seriesMap = new Map<string, ProviderUsageSeriesPoint>();
  const operationMap = new Map<string, ProviderUsageOperation>();

  buckets.forEach((bucket) => {
    addUsage(summary, bucket);

    const bucketKey = bucket.bucketStart.toISOString();
    const seriesPoint = seriesMap.get(bucketKey) ?? {
      bucketStart: bucketKey,
      ...emptySummary(),
    };
    addUsage(seriesPoint, bucket);
    seriesMap.set(bucketKey, seriesPoint);

    const operationKey = `${bucket.provider}\u0000${bucket.operation}`;
    const operation = operationMap.get(operationKey) ?? {
      provider: bucket.provider,
      operation: bucket.operation,
      ...emptySummary(),
    };
    addUsage(operation, bucket);
    operationMap.set(operationKey, operation);
  });

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    summary: finalizeSummary(summary),
    series: [...seriesMap.values()].map(finalizeSummary),
    operations: [...operationMap.values()]
      .map(finalizeSummary)
      .sort((left, right) => right.requestCount - left.requestCount),
  };
};

export const resetProviderUsageBufferForTests = () => {
  pendingUsage.clear();
};
