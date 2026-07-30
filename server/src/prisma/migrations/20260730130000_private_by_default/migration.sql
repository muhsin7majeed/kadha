-- Preserve existing visibility choices while changing defaults for future users.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "profilePrivacy" TEXT NOT NULL DEFAULT 'ONLY_ME',
    "watchedPrivacy" TEXT NOT NULL DEFAULT 'ONLY_ME',
    "likedPrivacy" TEXT NOT NULL DEFAULT 'ONLY_ME',
    "watchlistPrivacy" TEXT NOT NULL DEFAULT 'ONLY_ME',
    "watchRegion" TEXT NOT NULL DEFAULT 'US',
    "password" TEXT NOT NULL,
    "recoveryCodeHash" TEXT,
    "recoveryCodeIssuedAt" DATETIME,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_users" (
    "id",
    "username",
    "role",
    "profilePrivacy",
    "watchedPrivacy",
    "likedPrivacy",
    "watchlistPrivacy",
    "watchRegion",
    "password",
    "recoveryCodeHash",
    "recoveryCodeIssuedAt",
    "sessionVersion",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "username",
    "role",
    "profilePrivacy",
    "watchedPrivacy",
    "likedPrivacy",
    "watchlistPrivacy",
    "watchRegion",
    "password",
    "recoveryCodeHash",
    "recoveryCodeIssuedAt",
    "sessionVersion",
    "createdAt",
    "updatedAt"
FROM "users";

DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
