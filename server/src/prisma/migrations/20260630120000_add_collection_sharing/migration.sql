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
    CONSTRAINT "collection_items_media_id_media_type_fkey" FOREIGN KEY ("media_id", "media_type") REFERENCES "media_snapshots" ("media_id", "media_type") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_collection_items" ("collectionId", "created_at", "id", "media_id", "media_type") SELECT "collectionId", "created_at", "id", "media_id", "media_type" FROM "collection_items";
DROP TABLE "collection_items";
ALTER TABLE "new_collection_items" RENAME TO "collection_items";
CREATE UNIQUE INDEX "collection_items_collectionId_media_id_media_type_key" ON "collection_items"("collectionId", "media_id", "media_type");
CREATE INDEX "collection_items_collectionId_idx" ON "collection_items"("collectionId");
CREATE INDEX "collection_items_media_id_media_type_idx" ON "collection_items"("media_id", "media_type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "collection_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "collection_members_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "collection_invites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "collection_invites_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_invites_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_invites_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_members_collectionId_userId_key" ON "collection_members"("collectionId", "userId");
CREATE INDEX "collection_members_userId_idx" ON "collection_members"("userId");
CREATE INDEX "collection_members_collectionId_role_idx" ON "collection_members"("collectionId", "role");
CREATE INDEX "collection_invites_collectionId_inviteeId_status_idx" ON "collection_invites"("collectionId", "inviteeId", "status");
CREATE INDEX "collection_invites_inviteeId_status_idx" ON "collection_invites"("inviteeId", "status");
CREATE INDEX "collection_invites_collectionId_status_idx" ON "collection_invites"("collectionId", "status");
