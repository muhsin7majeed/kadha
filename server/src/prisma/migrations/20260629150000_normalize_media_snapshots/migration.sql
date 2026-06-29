-- CreateTable
CREATE TABLE "media_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "title" TEXT,
    "original_title" TEXT,
    "overview" TEXT,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "vote_average" REAL,
    "vote_count" INTEGER,
    "popularity" REAL,
    "adult" BOOLEAN,
    "genre_ids" TEXT,
    "release_date" TEXT,
    "original_language" TEXT,
    "runtime" INTEGER,
    "status" TEXT,
    "firstSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Backfill snapshots from saved user media.
INSERT OR IGNORE INTO "media_snapshots" (
    "id",
    "media_id",
    "media_type",
    "title",
    "poster_path",
    "vote_average",
    "vote_count",
    "adult",
    "genre_ids",
    "release_date",
    "firstSyncedAt",
    "lastSyncedAt"
)
SELECT
    lower(hex(randomblob(16))),
    "media_id",
    "media_type",
    max("title"),
    max("poster_path"),
    max("vote_average"),
    max("vote_count"),
    max("adult"),
    max("genre_ids"),
    max("release_date"),
    min("createdAt"),
    max("updatedAt")
FROM "user_media"
GROUP BY "media_id", "media_type";

-- Backfill snapshots from collection-only items.
INSERT OR IGNORE INTO "media_snapshots" (
    "id",
    "media_id",
    "media_type",
    "title",
    "poster_path",
    "vote_average",
    "vote_count",
    "adult",
    "genre_ids",
    "release_date",
    "firstSyncedAt",
    "lastSyncedAt"
)
SELECT
    lower(hex(randomblob(16))),
    "media_id",
    "media_type",
    max("title"),
    max("poster_path"),
    max("vote_average"),
    max("vote_count"),
    max("adult"),
    max("genre_ids"),
    max("release_date"),
    min("created_at"),
    max("created_at")
FROM "collection_items"
GROUP BY "media_id", "media_type";

-- Create media snapshot indexes before rebuilding foreign-key consumers.
CREATE UNIQUE INDEX "media_snapshots_media_id_media_type_key" ON "media_snapshots"("media_id", "media_type");
CREATE INDEX "media_snapshots_media_type_idx" ON "media_snapshots"("media_type");
CREATE INDEX "media_snapshots_media_type_popularity_idx" ON "media_snapshots"("media_type", "popularity");

-- Rebuild user_media with user state only.
ALTER TABLE "user_media" RENAME TO "user_media_old";

CREATE TABLE "user_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchlist" BOOLEAN NOT NULL DEFAULT false,
    "likedAt" DATETIME,
    "watchedAt" DATETIME,
    "watchlistAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_media_media_id_media_type_fkey" FOREIGN KEY ("media_id", "media_type") REFERENCES "media_snapshots" ("media_id", "media_type") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "user_media" (
    "id",
    "userId",
    "media_id",
    "media_type",
    "liked",
    "watched",
    "watchlist",
    "likedAt",
    "watchedAt",
    "watchlistAt",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "userId",
    "media_id",
    "media_type",
    "liked",
    "watched",
    "watchlist",
    CASE WHEN "liked" THEN "updatedAt" ELSE NULL END,
    CASE WHEN "watched" THEN "updatedAt" ELSE NULL END,
    CASE WHEN "watchlist" THEN "updatedAt" ELSE NULL END,
    "createdAt",
    "updatedAt"
FROM "user_media_old";

DROP TABLE "user_media_old";

-- Rebuild collection_items with media relation only.
ALTER TABLE "collection_items" RENAME TO "collection_items_old";

CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_items_media_id_media_type_fkey" FOREIGN KEY ("media_id", "media_type") REFERENCES "media_snapshots" ("media_id", "media_type") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "collection_items" (
    "id",
    "collectionId",
    "media_id",
    "media_type",
    "created_at"
)
SELECT
    "id",
    "collectionId",
    "media_id",
    "media_type",
    "created_at"
FROM "collection_items_old";

DROP TABLE "collection_items_old";

-- CreateIndex
CREATE UNIQUE INDEX "user_media_userId_media_id_media_type_key" ON "user_media"("userId", "media_id", "media_type");
CREATE INDEX "user_media_userId_idx" ON "user_media"("userId");
CREATE INDEX "user_media_userId_watched_idx" ON "user_media"("userId", "watched");
CREATE INDEX "user_media_userId_liked_idx" ON "user_media"("userId", "liked");
CREATE INDEX "user_media_userId_watchlist_idx" ON "user_media"("userId", "watchlist");
CREATE INDEX "user_media_userId_watchedAt_idx" ON "user_media"("userId", "watchedAt");
CREATE INDEX "user_media_userId_likedAt_idx" ON "user_media"("userId", "likedAt");
CREATE INDEX "user_media_userId_watchlistAt_idx" ON "user_media"("userId", "watchlistAt");
CREATE INDEX "user_media_media_id_media_type_idx" ON "user_media"("media_id", "media_type");

CREATE UNIQUE INDEX "collection_items_collectionId_media_id_media_type_key" ON "collection_items"("collectionId", "media_id", "media_type");
CREATE INDEX "collection_items_collectionId_idx" ON "collection_items"("collectionId");
CREATE INDEX "collection_items_media_id_media_type_idx" ON "collection_items"("media_id", "media_type");
