ALTER TABLE "users" ADD COLUMN "recoveryCodeHash" TEXT;
ALTER TABLE "users" ADD COLUMN "recoveryCodeIssuedAt" DATETIME;
ALTER TABLE "users" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
