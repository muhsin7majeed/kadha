CREATE TABLE "watch_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "seasonNumber" INTEGER,
    "episodeNumber" INTEGER,
    "episodeId" INTEGER,
    "clientRequestId" TEXT,
    "watchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watchedOn" DATETIME,
    "rating" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "watch_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "watch_events" (
    "id", "userId", "media_id", "media_type", "watchedAt", "watchedOn", "note", "createdAt", "updatedAt"
)
SELECT
    'media-' || "id", "userId", "media_id", "media_type", COALESCE("watchedAt", "updatedAt"), "watchedOn", "watchedNote", "createdAt", "updatedAt"
FROM "user_media"
WHERE "watched" = 1;

INSERT INTO "watch_events" (
    "id", "userId", "media_id", "media_type", "seasonNumber", "episodeNumber", "episodeId", "watchedAt", "watchedOn", "rating", "note", "createdAt", "updatedAt"
)
SELECT
    'episode-' || "id", "userId", "media_id", "media_type", "seasonNumber", "episodeNumber", "episodeId", "watchedAt", "watchedOn", "rating", "note", "createdAt", "updatedAt"
FROM "user_episode_watches";

DROP TABLE "user_episode_watches";

CREATE UNIQUE INDEX "watch_events_userId_clientRequestId_key" ON "watch_events"("userId", "clientRequestId");
CREATE INDEX "watch_events_userId_media_id_media_type_idx" ON "watch_events"("userId", "media_id", "media_type");
CREATE INDEX "watch_events_userId_media_id_media_type_seasonNumber_episodeNumber_idx" ON "watch_events"("userId", "media_id", "media_type", "seasonNumber", "episodeNumber");
CREATE INDEX "watch_events_userId_watchedAt_idx" ON "watch_events"("userId", "watchedAt");
CREATE INDEX "watch_events_media_id_media_type_idx" ON "watch_events"("media_id", "media_type");
