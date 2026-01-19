-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchlist" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "poster_path" TEXT,
    "vote_average" REAL,
    "vote_count" INTEGER,
    "adult" BOOLEAN,
    "genre_ids" TEXT,
    "release_date" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "user_media_userId_idx" ON "user_media"("userId");

-- CreateIndex
CREATE INDEX "user_media_media_id_media_type_idx" ON "user_media"("media_id", "media_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_media_userId_media_id_media_type_key" ON "user_media"("userId", "media_id", "media_type");
