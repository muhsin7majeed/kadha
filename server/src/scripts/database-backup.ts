import { resolve } from "node:path";
import {
  createDatabaseBackup,
  getDatabaseBackupConfig,
  loadOrCreateBackupKey,
  restoreDatabaseBackup,
  verifyEncryptedDatabaseBackup,
} from "@/lib/database-backup";

const printUsage = () => {
  console.error(
    "Usage: database-backup <backup | verify <backup-file> | restore <backup-file>>",
  );
};

async function main() {
  const [command = "backup", backupFile] = process.argv.slice(2);
  const config = getDatabaseBackupConfig(process.env);
  const encryptionKey = await loadOrCreateBackupKey(config);

  if (command === "backup") {
    const result = await createDatabaseBackup({
      databaseUrl: config.databaseUrl,
      databasePath: config.databasePath,
      backupDirectory: config.backupDirectory,
      encryptionKey,
      retentionCount: config.retentionCount,
    });

    if (result.status === "skipped") {
      console.log(
        "Database file does not exist yet; skipping the pre-migration backup.",
      );
      return;
    }

    console.log(
      `Created and verified encrypted database backup: ${result.path}`,
    );
    if (result.removedBackupCount > 0) {
      console.log(
        `Removed ${result.removedBackupCount} expired database backup(s).`,
      );
    }
    return;
  }

  if ((command === "verify" || command === "restore") && backupFile) {
    const backupPath = resolve(backupFile);
    if (command === "verify") {
      await verifyEncryptedDatabaseBackup(backupPath, encryptionKey);
      console.log(`Verified encrypted database backup: ${backupPath}`);
      return;
    }

    const result = await restoreDatabaseBackup(
      backupPath,
      config.databasePath,
      encryptionKey,
    );
    console.log(`Restored database backup to: ${config.databasePath}`);
    if (result.previousPath) {
      console.log(`Preserved the previous database at: ${result.previousPath}`);
    }
    return;
  }

  printUsage();
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Database backup command failed: ${message}`);
  process.exitCode = 1;
});
