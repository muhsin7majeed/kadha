-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_collection_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "addedByUserId" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_items_media_id_media_type_fkey" FOREIGN KEY ("media_id", "media_type") REFERENCES "media_snapshots" ("media_id", "media_type") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_items_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_collection_items" ("addedByUserId", "collectionId", "created_at", "id", "media_id", "media_type")
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM "users" WHERE "users"."id" = "collection_items"."addedByUserId")
        THEN "collection_items"."addedByUserId"
        ELSE NULL
    END,
    "collectionId",
    "created_at",
    "id",
    "media_id",
    "media_type"
FROM "collection_items";

DROP TABLE "collection_items";
ALTER TABLE "new_collection_items" RENAME TO "collection_items";
CREATE UNIQUE INDEX "collection_items_collectionId_media_id_media_type_key" ON "collection_items"("collectionId", "media_id", "media_type");
CREATE INDEX "collection_items_collectionId_idx" ON "collection_items"("collectionId");
CREATE INDEX "collection_items_addedByUserId_idx" ON "collection_items"("addedByUserId");
CREATE INDEX "collection_items_media_id_media_type_idx" ON "collection_items"("media_id", "media_type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
