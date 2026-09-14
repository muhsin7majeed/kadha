CREATE TABLE "feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "sourcePath" TEXT,
    "appVersion" TEXT,
    "adminResponse" TEXT,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "feedback_userId_createdAt_idx" ON "feedback"("userId", "createdAt");
CREATE INDEX "feedback_status_createdAt_idx" ON "feedback"("status", "createdAt");
CREATE INDEX "feedback_category_createdAt_idx" ON "feedback"("category", "createdAt");
