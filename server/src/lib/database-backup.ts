import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  appendFile,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { tmpdir } from "node:os";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const BACKUP_MAGIC = Buffer.from("KADHA-BACKUP-V1\0");
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const BACKUP_FILE_PATTERN = /^kadha-\d{8}T\d{9}Z-[a-f0-9]{8}\.sqlite\.enc$/;

export interface DatabaseBackupConfig {
  databaseUrl: string;
  databasePath: string;
  backupDirectory: string;
  keyFile: string;
  retentionCount: number;
  encodedKey?: string;
}

export interface CreateDatabaseBackupOptions {
  databaseUrl: string;
  databasePath: string;
  backupDirectory: string;
  encryptionKey: Buffer;
  retentionCount: number;
  now?: Date;
}

export type CreateDatabaseBackupResult =
  | { status: "created"; path: string; removedBackupCount: number }
  | { status: "skipped"; reason: "database-not-found" };

const createPrismaClient = (databaseUrl: string) => {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
};

const fileExists = async (path: string) => {
  try {
    await stat(path);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
};

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  name: string,
) => {
  if (!value?.trim()) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
};

export const resolveSqliteDatabasePath = (
  databaseUrl: string,
  workingDirectory = process.cwd(),
) => {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "Database backups currently support only file-based SQLite DATABASE_URL values",
    );
  }

  const withoutScheme = databaseUrl.slice("file:".length).split(/[?#]/, 1)[0];
  const decodedPath = decodeURIComponent(withoutScheme);
  if (!decodedPath || decodedPath === ":memory:") {
    throw new Error(
      "Database backups require a persistent SQLite database file",
    );
  }

  return isAbsolute(decodedPath)
    ? resolve(decodedPath)
    : resolve(workingDirectory, decodedPath);
};

export const getDatabaseBackupConfig = (
  environment: NodeJS.ProcessEnv,
  workingDirectory = process.cwd(),
): DatabaseBackupConfig => {
  const databaseUrl = environment.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const databasePath = resolveSqliteDatabasePath(databaseUrl, workingDirectory);
  const backupDirectory = resolve(
    environment.DATABASE_BACKUP_DIRECTORY?.trim() ||
      join(dirname(databasePath), "backups"),
  );

  return {
    databaseUrl,
    databasePath,
    backupDirectory,
    keyFile: resolve(
      environment.DATABASE_BACKUP_KEY_FILE?.trim() ||
        join(dirname(databasePath), ".kadha-backup-key"),
    ),
    retentionCount: parsePositiveInteger(
      environment.DATABASE_BACKUP_RETENTION,
      4,
      "DATABASE_BACKUP_RETENTION",
    ),
    encodedKey: environment.DATABASE_BACKUP_KEY?.trim() || undefined,
  };
};

const decodeEncryptionKey = (encodedKey: string) => {
  const key = Buffer.from(encodedKey, "base64");
  if (
    key.length !== KEY_LENGTH ||
    key.toString("base64") !== encodedKey.replace(/\s/g, "")
  ) {
    throw new Error("DATABASE_BACKUP_KEY must be a base64-encoded 32-byte key");
  }
  return key;
};

export const loadOrCreateBackupKey = async (
  config: Pick<DatabaseBackupConfig, "encodedKey" | "keyFile">,
) => {
  if (config.encodedKey) {
    return decodeEncryptionKey(config.encodedKey);
  }

  try {
    return decodeEncryptionKey((await readFile(config.keyFile, "utf8")).trim());
  } catch (error: unknown) {
    if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      throw error;
    }
  }

  await mkdir(dirname(config.keyFile), { recursive: true });
  const key = randomBytes(KEY_LENGTH);
  try {
    await writeFile(config.keyFile, `${key.toString("base64")}\n`, {
      flag: "wx",
      mode: 0o600,
    });
    return key;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      return decodeEncryptionKey(
        (await readFile(config.keyFile, "utf8")).trim(),
      );
    }
    throw error;
  }
};

const quoteSqliteString = (value: string) => value.replaceAll("'", "''");

const createConsistentSqliteCopy = async (
  databaseUrl: string,
  destination: string,
) => {
  const prisma = createPrismaClient(databaseUrl);
  try {
    await prisma.$executeRawUnsafe(
      `VACUUM INTO '${quoteSqliteString(destination)}'`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const verifySqliteDatabase = async (databasePath: string) => {
  const prisma = createPrismaClient(`file:${databasePath}`);
  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      "PRAGMA integrity_check",
    );
    const results = rows.flatMap((row) => Object.values(row));
    if (results.length !== 1 || results[0] !== "ok") {
      throw new Error(
        `SQLite integrity check failed: ${results.map(String).join(", ") || "no result"}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
};

const encryptFile = async (
  source: string,
  destination: string,
  encryptionKey: Buffer,
) => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

  await writeFile(destination, Buffer.concat([BACKUP_MAGIC, iv]), {
    flag: "wx",
    mode: 0o600,
  });
  await pipeline(
    createReadStream(source),
    cipher,
    createWriteStream(destination, { flags: "a" }),
  );
  await appendFile(destination, cipher.getAuthTag());
};

const decryptFile = async (
  source: string,
  destination: string,
  encryptionKey: Buffer,
) => {
  const sourceStat = await stat(source);
  const minimumSize = BACKUP_MAGIC.length + IV_LENGTH + AUTH_TAG_LENGTH + 1;
  if (sourceStat.size < minimumSize) {
    throw new Error("Backup file is too small or incomplete");
  }

  const sourceHandle = await open(source, "r");
  try {
    const header = Buffer.alloc(BACKUP_MAGIC.length + IV_LENGTH);
    const authTag = Buffer.alloc(AUTH_TAG_LENGTH);
    await sourceHandle.read(header, 0, header.length, 0);
    await sourceHandle.read(
      authTag,
      0,
      authTag.length,
      sourceStat.size - AUTH_TAG_LENGTH,
    );

    if (!header.subarray(0, BACKUP_MAGIC.length).equals(BACKUP_MAGIC)) {
      throw new Error("Backup file has an unsupported format");
    }

    const iv = header.subarray(BACKUP_MAGIC.length);
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv);
    decipher.setAuthTag(authTag);
    await pipeline(
      createReadStream(source, {
        start: header.length,
        end: sourceStat.size - AUTH_TAG_LENGTH - 1,
      }),
      decipher,
      createWriteStream(destination, { flags: "wx", mode: 0o600 }),
    );
  } finally {
    await sourceHandle.close();
  }
};

export const verifyEncryptedDatabaseBackup = async (
  backupPath: string,
  encryptionKey: Buffer,
) => {
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), "kadha-backup-verify-"),
  );
  const decryptedPath = join(temporaryDirectory, "restored.sqlite");
  try {
    await decryptFile(backupPath, decryptedPath, encryptionKey);
    await verifySqliteDatabase(decryptedPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
};

const removeExpiredBackups = async (
  backupDirectory: string,
  retentionCount: number,
) => {
  const backupFiles = (await readdir(backupDirectory))
    .filter((name) => BACKUP_FILE_PATTERN.test(name))
    .sort()
    .reverse();
  const expiredFiles = backupFiles.slice(retentionCount);
  await Promise.all(
    expiredFiles.map((name) =>
      rm(join(backupDirectory, name), { force: true }),
    ),
  );
  return expiredFiles.length;
};

const createBackupFilename = (now: Date) => {
  const timestamp = now.toISOString().replace(/[-:.]/g, "");
  return `kadha-${timestamp}-${randomBytes(4).toString("hex")}.sqlite.enc`;
};

export const createDatabaseBackup = async (
  options: CreateDatabaseBackupOptions,
): Promise<CreateDatabaseBackupResult> => {
  if (!(await fileExists(options.databasePath))) {
    return { status: "skipped", reason: "database-not-found" };
  }

  await mkdir(options.backupDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(
    join(options.backupDirectory, ".pending-"),
  );
  const sqliteCopyPath = join(temporaryDirectory, "database.sqlite");
  const pendingBackupPath = join(temporaryDirectory, "database.sqlite.enc");
  const backupPath = join(
    options.backupDirectory,
    createBackupFilename(options.now ?? new Date()),
  );

  try {
    await createConsistentSqliteCopy(options.databaseUrl, sqliteCopyPath);
    await verifySqliteDatabase(sqliteCopyPath);
    await encryptFile(sqliteCopyPath, pendingBackupPath, options.encryptionKey);
    await verifyEncryptedDatabaseBackup(
      pendingBackupPath,
      options.encryptionKey,
    );
    await rename(pendingBackupPath, backupPath);
    const removedBackupCount = await removeExpiredBackups(
      options.backupDirectory,
      options.retentionCount,
    );
    return { status: "created", path: backupPath, removedBackupCount };
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
};

export const restoreDatabaseBackup = async (
  backupPath: string,
  databasePath: string,
  encryptionKey: Buffer,
) => {
  if (
    (await fileExists(`${databasePath}-wal`)) ||
    (await fileExists(`${databasePath}-shm`))
  ) {
    throw new Error(
      "Refusing to restore while SQLite WAL files exist; stop the server cleanly first",
    );
  }

  await mkdir(dirname(databasePath), { recursive: true });
  const temporaryDirectory = await mkdtemp(
    join(dirname(databasePath), ".restore-"),
  );
  const restoredPath = join(temporaryDirectory, "restored.sqlite");
  const previousPath = `${databasePath}.pre-restore-${new Date().toISOString().replace(/[-:.]/g, "")}`;
  const hadExistingDatabase = await fileExists(databasePath);

  try {
    await decryptFile(backupPath, restoredPath, encryptionKey);
    await verifySqliteDatabase(restoredPath);
    if (hadExistingDatabase) {
      await rename(databasePath, previousPath);
    }
    try {
      await rename(restoredPath, databasePath);
    } catch (error: unknown) {
      if (hadExistingDatabase) {
        await rename(previousPath, databasePath);
      }
      throw error;
    }
    return { previousPath: hadExistingDatabase ? previousPath : null };
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
};
