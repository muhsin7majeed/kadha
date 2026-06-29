CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "media_id" INTEGER,
    "media_type" TEXT,
    "collectionId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt");
CREATE INDEX "user_activities_userId_type_idx" ON "user_activities"("userId", "type");
CREATE INDEX "user_activities_media_id_media_type_idx" ON "user_activities"("media_id", "media_type");
CREATE INDEX "user_activities_collectionId_idx" ON "user_activities"("collectionId");
