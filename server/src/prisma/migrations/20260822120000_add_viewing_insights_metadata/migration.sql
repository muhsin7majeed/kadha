-- Add shared metadata enrichment state to canonical media snapshots.
ALTER TABLE "media_snapshots" ADD COLUMN "metadataStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "media_snapshots" ADD COLUMN "metadataVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "media_snapshots" ADD COLUMN "detailsUpdatedAt" DATETIME;
ALTER TABLE "media_snapshots" ADD COLUMN "creditsUpdatedAt" DATETIME;
ALTER TABLE "media_snapshots" ADD COLUMN "lastMetadataAttemptAt" DATETIME;
ALTER TABLE "media_snapshots" ADD COLUMN "metadataFailureCode" TEXT;

-- CreateTable
CREATE TABLE "genres" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media_genres" (
    "mediaSnapshotId" TEXT NOT NULL,
    "genreId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("mediaSnapshotId", "genreId"),
    CONSTRAINT "media_genres_mediaSnapshotId_fkey" FOREIGN KEY ("mediaSnapshotId") REFERENCES "media_snapshots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "media_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "people" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "profilePath" TEXT,
    "knownForDepartment" TEXT,
    "metadataUpdatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media_credits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaSnapshotId" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "creditKey" TEXT NOT NULL,
    "tmdbCreditId" TEXT,
    "kind" TEXT NOT NULL,
    "department" TEXT,
    "job" TEXT,
    "character" TEXT,
    "billingOrder" INTEGER,
    "aggregateEpisodeCount" INTEGER,
    "metadataUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_credits_mediaSnapshotId_fkey" FOREIGN KEY ("mediaSnapshotId") REFERENCES "media_snapshots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "media_credits_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_metadata_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaSnapshotId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_metadata_jobs_mediaSnapshotId_fkey" FOREIGN KEY ("mediaSnapshotId") REFERENCES "media_snapshots" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "media_genres_genreId_idx" ON "media_genres"("genreId");
CREATE UNIQUE INDEX "media_credits_mediaSnapshotId_creditKey_key" ON "media_credits"("mediaSnapshotId", "creditKey");
CREATE INDEX "media_credits_mediaSnapshotId_kind_billingOrder_idx" ON "media_credits"("mediaSnapshotId", "kind", "billingOrder");
CREATE INDEX "media_credits_personId_kind_idx" ON "media_credits"("personId", "kind");
CREATE UNIQUE INDEX "media_metadata_jobs_mediaSnapshotId_key" ON "media_metadata_jobs"("mediaSnapshotId");
CREATE INDEX "media_metadata_jobs_availableAt_lockedAt_idx" ON "media_metadata_jobs"("availableAt", "lockedAt");

-- Backfill durable enrichment jobs for existing canonical media.
INSERT INTO "media_metadata_jobs" (
    "id",
    "mediaSnapshotId",
    "attempts",
    "availableAt",
    "createdAt",
    "updatedAt"
)
SELECT
    lower(hex(randomblob(16))),
    "id",
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "media_snapshots";
