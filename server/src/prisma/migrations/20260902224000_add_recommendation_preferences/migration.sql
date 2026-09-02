CREATE TABLE "recommendation_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "useLiked" BOOLEAN NOT NULL DEFAULT true,
    "useRatings" BOOLEAN NOT NULL DEFAULT true,
    "useWatched" BOOLEAN NOT NULL DEFAULT true,
    "useRewatchHistory" BOOLEAN NOT NULL DEFAULT true,
    "useWatchlist" BOOLEAN NOT NULL DEFAULT false,
    "excludeWatched" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recommendation_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "recommendation_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recommendation_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recommendation_feedback_media_id_media_type_fkey" FOREIGN KEY ("media_id", "media_type") REFERENCES "media_snapshots" ("media_id", "media_type") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "recommendation_settings_userId_key" ON "recommendation_settings"("userId");
CREATE UNIQUE INDEX "recommendation_feedback_userId_media_id_media_type_key" ON "recommendation_feedback"("userId", "media_id", "media_type");
CREATE INDEX "recommendation_feedback_userId_type_idx" ON "recommendation_feedback"("userId", "type");
CREATE INDEX "recommendation_feedback_media_id_media_type_idx" ON "recommendation_feedback"("media_id", "media_type");
