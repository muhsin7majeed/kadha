UPDATE "users"
SET "profilePrivacy" = 'KADHA_USERS'
WHERE "profilePrivacy" = 'EVERYONE';

UPDATE "users"
SET "watchedPrivacy" = 'KADHA_USERS'
WHERE "watchedPrivacy" = 'EVERYONE';

UPDATE "users"
SET "likedPrivacy" = 'KADHA_USERS'
WHERE "likedPrivacy" = 'EVERYONE';

UPDATE "users"
SET "watchlistPrivacy" = 'KADHA_USERS'
WHERE "watchlistPrivacy" = 'EVERYONE';

UPDATE "collections"
SET "privacy" = 'KADHA_USERS'
WHERE "privacy" = 'EVERYONE';
