-- AlterTable
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actorId" TEXT,
    "referenceId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "dedupeKey" TEXT,
    "metadata" TEXT,
    "readAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Backfill existing notification references into the new entity fields where possible.
INSERT INTO "new_notifications" (
    "id",
    "userId",
    "type",
    "read",
    "actorId",
    "referenceId",
    "entityType",
    "entityId",
    "readAt",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "userId",
    "type",
    "read",
    "actorId",
    "referenceId",
    CASE
        WHEN "type" IN ('FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_ACCEPTED') THEN 'friendship'
        ELSE NULL
    END,
    "referenceId",
    CASE
        WHEN "read" = true THEN CURRENT_TIMESTAMP
        ELSE NULL
    END,
    "createdAt",
    COALESCE("createdAt", CURRENT_TIMESTAMP)
FROM "notifications";

DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_entityType_entityId_idx" ON "notifications"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_dedupeKey_key" ON "notifications"("userId", "dedupeKey");
