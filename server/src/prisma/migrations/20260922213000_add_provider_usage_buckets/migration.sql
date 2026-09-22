-- CreateTable
CREATE TABLE "provider_usage_buckets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "bucketStart" DATETIME NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "rateLimitedCount" INTEGER NOT NULL DEFAULT 0,
    "cacheHitCount" INTEGER NOT NULL DEFAULT 0,
    "totalDurationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_usage_buckets_provider_operation_bucketStart_key" ON "provider_usage_buckets"("provider", "operation", "bucketStart");

-- CreateIndex
CREATE INDEX "provider_usage_buckets_provider_bucketStart_idx" ON "provider_usage_buckets"("provider", "bucketStart");
