/**
 * Cloudflare R2 Backup System — Backup Service
 *
 * Main orchestrator that coordinates:
 *   Data Collection → JSON Serialization → AES-256 Encryption
 *   → R2 Upload → Verification → Metadata Persistence
 *
 * Uses dependency injection for all external dependencies.
 */

import type { PrismaClient } from "@prisma/client";
import type { R2Config, BackupRunSummary } from "./backup.types";
import { MONTH_NAMES } from "./backup.types";
import { R2StorageClient } from "./r2.client";
import { BackupDataCollector } from "./backup.data-collector";
import { encryptBackupData } from "./backup.encryption";
import { BackupLogger } from "./backup.logger";
import { sendCloudBackupSuccessEmail, sendCloudBackupFailedEmail } from "../common/utils/email";
import * as zlib from "zlib";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);

export class CloudBackupService {
  private readonly prisma: PrismaClient;
  private readonly r2Client: R2StorageClient;
  private readonly dataCollector: BackupDataCollector;
  private readonly config: R2Config;
  private readonly logger: BackupLogger;

  constructor(
    prisma: PrismaClient,
    r2Client: R2StorageClient,
    dataCollector: BackupDataCollector,
    config: R2Config,
    logger: BackupLogger,
  ) {
    this.prisma = prisma;
    this.r2Client = r2Client;
    this.dataCollector = dataCollector;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Generate the R2 storage path for a backup.
   *
   * Format: {tenantId}/{year}/{MM-MonthName}/{yyyy-MM-dd_HH-mmAM.json.enc}
   * Example: clxyz123/2026/01-January/2026-01-01_02-00AM.json.enc
   */
  private generateStoragePath(tenantId: string, backupDate: Date, mode: "FULL" | "INCREMENTAL", businessName?: string): string {
    const year = backupDate.getFullYear();
    const month = backupDate.getMonth() + 1; // 1-12
    const monthFolder = MONTH_NAMES[month] || `${String(month).padStart(2, "0")}-Unknown`;

    const day = String(backupDate.getDate()).padStart(2, "0");
    const hours24 = backupDate.getHours();
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 < 12 ? "AM" : "PM";
    const minutes = String(backupDate.getMinutes()).padStart(2, "0");

    const folderType = mode === "FULL" ? "FULL" : "INCREMENTAL";
    const ext = mode === "FULL" ? ".full.enc" : ".inc.enc";
    const fileName = `${year}-${String(month).padStart(2, "0")}-${day}_${String(hours12).padStart(2, "0")}-${minutes}${ampm}${ext}`;

    const cleanTenantId = tenantId.startsWith("tenant-") ? tenantId.replace("tenant-", "") : tenantId;
    const sanitizedBusinessName = businessName ? businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
    const namePart = sanitizedBusinessName ? `-${sanitizedBusinessName}` : "";
    
    const formattedTenantId = `tenant${namePart}-${cleanTenantId}`;
    return `${formattedTenantId}/${year}/${monthFolder}/${folderType}/${fileName}`;
  }

  /**
   * Extract the file name from a storage path.
   */
  private extractFileName(storagePath: string): string {
    const parts = storagePath.split("/");
    return parts[parts.length - 1] || storagePath;
  }

  /**
   * Create a backup for a single tenant.
   *
   * Flow:
   * 1. Create CloudBackup record with PENDING status
   * 2. Collect tenant data
   * 3. Serialize to JSON and encrypt
   * 4. Upload to R2
   * 5. Verify upload
   * 6. Update record to COMPLETED
   */
  async createBackup(tenantId: string, backupDate: Date, forceFull: boolean = true): Promise<{ id: string; status: string; skippedReason?: string }> {
    const startTime = Date.now();
    const year = backupDate.getFullYear();
    const month = backupDate.getMonth() + 1;

    // Resolve Incremental vs Full
    let mode: "FULL" | "INCREMENTAL" = forceFull ? "FULL" : "INCREMENTAL";
    let parentBackupId: string | null = null;
    let previousBackupId: string | null = null;
    let lastBackupTimestamp: Date | null = null;

    if (!forceFull) {
      const lastCompletedBackup = await (this.prisma as any).cloudBackup.findFirst({
        where: { tenantId, status: "COMPLETED" },
        orderBy: { backupDate: "desc" },
      });

      if (lastCompletedBackup) {
        previousBackupId = lastCompletedBackup.id;
        lastBackupTimestamp = lastCompletedBackup.backupDate;
        parentBackupId = lastCompletedBackup.mode === "FULL" ? lastCompletedBackup.id : lastCompletedBackup.parentBackupId;
      } else {
        // Fallback to FULL if there is no previous backup
        mode = "FULL";
      }
    }

    let tenantEmail = "";
    let businessName = "";
    try {
      const t = await (this.prisma as any).tenant.findUnique({ where: { id: tenantId }});
      if (t) {
        tenantEmail = t.email;
        businessName = t.businessName;
      }
    } catch (e) {
      this.logger.warn("Could not fetch tenant info", { tenantId });
    }

    const storagePath = this.generateStoragePath(tenantId, backupDate, mode, businessName);
    const fileName = this.extractFileName(storagePath);

    this.logger.info("Starting backup", { tenantId, storagePath });

    // Step 1: Create backup record with PENDING status
    let backupRecord: any;
    try {
      backupRecord = await (this.prisma as any).cloudBackup.create({
        data: {
          tenantId,
          fileName,
          year,
          month,
          backupDate,
          storagePath,
          checksum: "",
          status: "PENDING",
          mode,
          parentBackupId,
          previousBackupId,
          lastBackupTimestamp,
          isCompressed: true,
        },
      });
    } catch (error: any) {
      // Handle duplicate — backup already exists for this tenant+fileName
      if (error?.code === "P2002") {
        this.logger.info("Backup already exists, skipping", { tenantId, fileName });
        return { id: "", status: "SKIPPED" };
      }
      throw error;
    }

    try {
      // Step 2: Update status to IN_PROGRESS
      await (this.prisma as any).cloudBackup.update({
        where: { id: backupRecord.id },
        data: { status: "IN_PROGRESS" },
      });

      // Step 3: Collect tenant data (incremental if since is provided)
      const { summary, ...snapshot } = await this.dataCollector.collectTenantData(tenantId, backupDate, lastBackupTimestamp || undefined);

      if (mode === "INCREMENTAL" && summary.totalChangedRecords === 0) {
        this.logger.info("No changes detected. Backup skipped.", { tenantId });
        await (this.prisma as any).cloudBackup.update({
          where: { id: backupRecord.id },
          data: { status: "CANCELLED", errorMessage: "No changes detected. Backup skipped." } // Cancelled or a new SKIPPED status
        });
        return { id: backupRecord.id, status: "SKIPPED", skippedReason: "No changes detected. Backup skipped." };
      }

      // Step 4: Serialize and Compress
      const rawJson = Buffer.from(JSON.stringify(snapshot, null, 2), "utf-8");
      const compressedData = await gzip(rawJson);
      this.logger.info("Data serialized and compressed", {
        tenantId,
        rawSizeBytes: rawJson.length,
        compressedSizeBytes: compressedData.length,
      });

      // Step 5: Encrypt using AES-256-GCM
      const encrypted = encryptBackupData(compressedData, this.config.encryptionKey);
      this.logger.info("Data encrypted", {
        tenantId,
        encryptedSizeBytes: encrypted.data.length,
        checksum: encrypted.checksum,
      });

      // Step 6: Upload to R2
      this.logger.info("Upload Started", { tenantId, storagePath });
      const maxRetries = 3;
      let uploadSuccess = false;
      let lastUploadError: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await this.r2Client.upload(storagePath, encrypted.data, {
            tenantId,
            backupDate: backupDate.toISOString(),
            checksum: encrypted.checksum,
          });
          uploadSuccess = true;
          if (attempt > 1) {
            this.logger.info(`Upload succeeded on attempt ${attempt}`, { tenantId, storagePath });
            await (this.prisma as any).cloudBackup.update({
              where: { id: backupRecord.id },
              data: { retryCount: attempt - 1 }
            });
          }
          break; // Success, exit retry loop
        } catch (uploadError: any) {
          lastUploadError = uploadError;
          this.logger.warn(`Upload failed (attempt ${attempt}/${maxRetries}): ${uploadError.message}`, { tenantId, storagePath });
          
          if (attempt < maxRetries) {
             // small delay before retry
             await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
             await (this.prisma as any).cloudBackup.update({
               where: { id: backupRecord.id },
               data: { retryCount: maxRetries }
             });
          }
        }
      }

      if (!uploadSuccess) {
         throw new Error(`Upload failed after ${maxRetries} attempts: ${lastUploadError?.message}`);
      }
      this.logger.info("Upload Completed", { tenantId, storagePath });

      // Step 7: Verify upload
      const verified = await this.r2Client.verifyUpload(storagePath, encrypted.data.length);
      if (!verified) {
        await (this.prisma as any).cloudBackup.update({
          where: { id: backupRecord.id },
          data: {
            status: "VERIFICATION_FAILED",
            errorMessage: "Upload verification failed: size mismatch or file not found in R2",
            durationMs: Date.now() - startTime,
          },
        });
        this.logger.error("Backup verification failed", undefined, { tenantId, storagePath });
        return { id: backupRecord.id, status: "VERIFICATION_FAILED" };
      }

      // Step 8: Update record to COMPLETED
      await (this.prisma as any).cloudBackup.update({
        where: { id: backupRecord.id },
        data: {
          status: "COMPLETED",
          checksum: encrypted.checksum,
          fileSize: BigInt(encrypted.data.length),
          durationMs: Date.now() - startTime,
          changedRecordCount: summary.totalChangedRecords,
          snapshotSummary: summary,
        },
      });

      this.logger.info("Verification Completed", { tenantId, storagePath });

      this.logger.info("Backup completed successfully", {
        tenantId,
        backupId: backupRecord.id,
        storagePath,
        fileSize: encrypted.data.length,
        durationMs: Date.now() - startTime,
      });

      if (tenantEmail) {
        await sendCloudBackupSuccessEmail(tenantEmail, {
          fileName,
          fileSize: `${(encrypted.data.length / 1024 / 1024).toFixed(2)} MB`,
          time: new Date().toLocaleString(),
        }).catch(err => this.logger.error("Failed to send success email", err));
      }

      return { id: backupRecord.id, status: "COMPLETED" };
    } catch (error) {
      // On any error, mark the backup as failed
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const failStatus = errorMessage.toLowerCase().includes("upload")
        ? "UPLOAD_FAILED"
        : "FAILED";

      try {
        await (this.prisma as any).cloudBackup.update({
          where: { id: backupRecord.id },
          data: {
            status: failStatus,
            errorMessage: errorMessage.substring(0, 1000), // Truncate long errors
            durationMs,
          },
        });
      } catch (updateError) {
        this.logger.error("Failed to update backup status", updateError, {
          tenantId,
          backupId: backupRecord.id,
        });
      }

      this.logger.error("Backup failed", error, { tenantId, storagePath, durationMs, reason: errorMessage });
      
      if (tenantEmail) {
        await sendCloudBackupFailedEmail(tenantEmail, {
          reason: errorMessage,
          time: new Date().toLocaleString(),
        }).catch(err => this.logger.error("Failed to send failure email", err));
      }

      return { id: backupRecord.id, status: failStatus };
    }
  }

  /**
   * Run backups for all active tenants.
   * Processes tenants sequentially to avoid overwhelming R2 and the database.
   * One tenant failure does not abort the entire run.
   */
  async runBackupForAllTenants(): Promise<BackupRunSummary> {
    const startedAt = new Date();
    this.logger.info("Starting backup run for all tenants");

    // Fetch all active tenants
    const tenants = await (this.prisma as any).tenant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, businessName: true },
    });

    const summary: BackupRunSummary = {
      totalTenants: tenants.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      startedAt,
      completedAt: new Date(),
      durationMs: 0,
      errors: [],
    };

    this.logger.info(`Found ${tenants.length} active tenants to backup`);

    // Process tenants sequentially
    for (const tenant of tenants) {
      try {
        const result = await this.createBackup(tenant.id, startedAt);

        if (result.status === "COMPLETED") {
          summary.successful++;
        } else if (result.status === "SKIPPED") {
          summary.skipped++;
        } else {
          summary.failed++;
          summary.errors.push({
            tenantId: tenant.id,
            error: `Backup ended with status: ${result.status}`,
          });
        }
      } catch (error) {
        summary.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        summary.errors.push({ tenantId: tenant.id, error: errorMessage });
        this.logger.error("Unhandled error during tenant backup", error, {
          tenantId: tenant.id,
          businessName: tenant.businessName,
        });
      }
    }

    summary.completedAt = new Date();
    summary.durationMs = summary.completedAt.getTime() - startedAt.getTime();

    this.logger.info("Backup run completed", {
      totalTenants: summary.totalTenants,
      successful: summary.successful,
      failed: summary.failed,
      skipped: summary.skipped,
      durationMs: summary.durationMs,
    });

    if (summary.errors.length > 0) {
      this.logger.warn(`${summary.errors.length} tenant backup(s) failed`, {
        errors: summary.errors.slice(0, 10), // Log first 10 errors
      });
    }

    return summary;
  }
}
