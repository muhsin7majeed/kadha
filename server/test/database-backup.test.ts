import { randomBytes } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  createDatabaseBackup,
  getDatabaseBackupConfig,
  loadOrCreateBackupKey,
  restoreDatabaseBackup,
  verifyEncryptedDatabaseBackup,
} from "@/lib/database-backup";

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "kadha-database-backup-test-"),
  );
  temporaryDirectories.push(directory);
  return directory;
};

const createClient = (databasePath: string) => {
  const adapter = new PrismaBetterSqlite3({ url: `file:${databasePath}` });
  return new PrismaClient({ adapter });
};

const createSourceDatabase = async (databasePath: string) => {
  const prisma = createClient(databasePath);
  try {
    await prisma.$executeRawUnsafe(
      "CREATE TABLE backup_test (id INTEGER PRIMARY KEY, value TEXT NOT NULL)",
    );
    await prisma.$executeRawUnsafe(
      "INSERT INTO backup_test (value) VALUES ('preserved')",
    );
  } finally {
    await prisma.$disconnect();
  }
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("database backups", () => {
  it("creates, verifies, and restores an encrypted SQLite backup", async () => {
    const directory = await createTemporaryDirectory();
    const databasePath = join(directory, "source.sqlite");
    const backupDirectory = join(directory, "backups");
    const restoredPath = join(directory, "restored.sqlite");
    const encryptionKey = randomBytes(32);
    await createSourceDatabase(databasePath);

    const result = await createDatabaseBackup({
      databaseUrl: `file:${databasePath}`,
      databasePath,
      backupDirectory,
      encryptionKey,
      retentionCount: 14,
      now: new Date("2026-08-20T12:00:00.000Z"),
    });

    expect(result.status).toBe("created");
    if (result.status !== "created") {
      return;
    }

    await expect(
      verifyEncryptedDatabaseBackup(result.path, encryptionKey),
    ).resolves.toBeUndefined();
    await restoreDatabaseBackup(result.path, restoredPath, encryptionKey);

    const restoredClient = createClient(restoredPath);
    try {
      const rows = await restoredClient.$queryRawUnsafe<
        Array<{ value: string }>
      >("SELECT value FROM backup_test");
      expect(rows).toEqual([{ value: "preserved" }]);
    } finally {
      await restoredClient.$disconnect();
    }
  });

  it("keeps only the configured number of successful backups", async () => {
    const directory = await createTemporaryDirectory();
    const databasePath = join(directory, "source.sqlite");
    const backupDirectory = join(directory, "backups");
    const encryptionKey = randomBytes(32);
    await createSourceDatabase(databasePath);

    for (const date of [
      "2026-08-18T12:00:00.000Z",
      "2026-08-19T12:00:00.000Z",
      "2026-08-20T12:00:00.000Z",
    ]) {
      await createDatabaseBackup({
        databaseUrl: `file:${databasePath}`,
        databasePath,
        backupDirectory,
        encryptionKey,
        retentionCount: 2,
        now: new Date(date),
      });
    }

    const backupFiles = (await readdir(backupDirectory))
      .filter((name) => name.endsWith(".sqlite.enc"))
      .sort();
    expect(backupFiles).toHaveLength(2);
    expect(backupFiles[0]).toContain("20260819T120000000Z");
    expect(backupFiles[1]).toContain("20260820T120000000Z");
  });

  it("creates and reuses a persistent encryption key when one is not configured", async () => {
    const directory = await createTemporaryDirectory();
    const databasePath = join(directory, "source.sqlite");
    const config = getDatabaseBackupConfig(
      {
        DATABASE_URL: `file:${databasePath}`,
        DATABASE_BACKUP_DIRECTORY: join(directory, "backups"),
      },
      directory,
    );

    const firstKey = await loadOrCreateBackupKey(config);
    const secondKey = await loadOrCreateBackupKey(config);

    expect(firstKey).toHaveLength(32);
    expect(secondKey).toEqual(firstKey);
    expect(config.keyFile).toBe(join(directory, ".kadha-backup-key"));
    expect(config.retentionCount).toBe(4);
  });
});
