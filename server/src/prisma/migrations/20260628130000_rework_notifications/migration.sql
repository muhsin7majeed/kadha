-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "entityType" TEXT;
ALTER TABLE "notifications" ADD COLUMN "entityId" TEXT;
ALTER TABLE "notifications" ADD COLUMN "dedupeKey" TEXT;
ALTER TABLE "notifications" ADD COLUMN "metadata" TEXT;
ALTER TABLE "notifications" ADD COLUMN "readAt" DATETIME;
ALTER TABLE "notifications" ADD COLUMN "resolvedAt" DATETIME;
ALTER TABLE "notifications" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing notification references into the new entity fields where possible.
UPDATE "notifications"
SET
  "entityType" = CASE
    WHEN "type" IN ('FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_ACCEPTED') THEN 'friendship'
    ELSE NULL
  END,
  "entityId" = "referenceId",
  "readAt" = CASE
    WHEN "read" = true THEN CURRENT_TIMESTAMP
    ELSE NULL
  END;

-- CreateIndex
CREATE INDEX "notifications_entityType_entityId_idx" ON "notifications"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_dedupeKey_key" ON "notifications"("userId", "dedupeKey");
