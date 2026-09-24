CREATE TABLE "letterboxd_film_matches" (
    "userId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "letterboxd_film_matches_userId_uri_pk" PRIMARY KEY ("userId","uri"),
    CONSTRAINT "letterboxd_film_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
