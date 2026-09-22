export type ProviderUsageRange = "24h" | "7d" | "30d" | "90d";

export interface ProviderUsageSummary {
  requestCount: number;
  successCount: number;
  errorCount: number;
  rateLimitedCount: number;
  cacheHitCount: number;
  totalDurationMs: number;
  averageDurationMs: number;
  cacheHitRate: number;
}

export interface ProviderUsageSeriesPoint extends ProviderUsageSummary {
  bucketStart: string;
}

export interface ProviderUsageOperation extends ProviderUsageSummary {
  operation: string;
  provider: string;
}

export interface ProviderUsageReport {
  from: string;
  to: string;
  summary: ProviderUsageSummary;
  series: ProviderUsageSeriesPoint[];
  operations: ProviderUsageOperation[];
}
