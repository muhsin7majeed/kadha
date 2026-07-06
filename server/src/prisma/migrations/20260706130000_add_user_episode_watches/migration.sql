CREATE TABLE "user_episode_watches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "episodeId" INTEGER,
    "watchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watchedOn" DATETIME,
    "rating" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_episode_watches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "user_episode_watches_userId_media_id_media_type_seasonNumber_episodeNumber_key" ON "user_episode_watches"("userId", "media_id", "media_type", "seasonNumber", "episodeNumber");
CREATE INDEX "user_episode_watches_userId_media_id_media_type_idx" ON "user_episode_watches"("userId", "media_id", "media_type");
CREATE INDEX "user_episode_watches_userId_watchedAt_idx" ON "user_episode_watches"("userId", "watchedAt");
CREATE INDEX "user_episode_watches_media_id_media_type_idx" ON "user_episode_watches"("media_id", "media_type");
