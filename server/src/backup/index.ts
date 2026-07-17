/**
 * Cloudflare R2 Backup System — Composition Root
 *
 * Wires up all dependencies and exports a ready-to-use backup system.
 * Returns null if R2 is not configured (graceful degradation).
 */

import type { PrismaClient } from "@prisma/client";
import { loadR2Config } from "./r2.config";
import { R2StorageClient } from "./r2.client";
import { BackupDataCollector } from "./backup.data-collector";
import { CloudBackupService } from "./backup.service";
import { BackupScheduler } from "./backup.scheduler";
import { BackupLogger } from "./backup.logger";

export interface BackupSystem {
  scheduler: BackupScheduler;
  service: CloudBackupService;
}

/**
 * Create the complete backup system with all dependencies wired.
 *
 * @param prismaClient - The Prisma client instance (injected from outside)
 * @returns The backup system, or null if R2 is not configured
 */
export function createBackupSystem(prismaClient: PrismaClient): BackupSystem | null {
  const logger = new BackupLogger();

  // Load R2 configuration
  const r2Config = loadR2Config();
  if (!r2Config) {
    logger.warn(
      "R2 configuration not found — cloud backup system is disabled. " +
      "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, " +
      "R2_BUCKET_NAME, R2_ENDPOINT, and R2_BACKUP_ENCRYPTION_KEY to enable."
    );
    return null;
  }

  // Wire up all dependencies
  const r2Client = new R2StorageClient(r2Config, logger);
  const dataCollector = new BackupDataCollector(prismaClient, logger);
  const service = new CloudBackupService(prismaClient, r2Client, dataCollector, r2Config, logger);
  const scheduler = new BackupScheduler(service, logger);

  logger.info("Backup system initialized successfully", {
    bucket: r2Config.bucketName,
    endpoint: r2Config.endpoint,
  });

  return { scheduler, service };
}
