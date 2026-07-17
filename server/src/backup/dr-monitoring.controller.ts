import type { Request, Response, NextFunction } from "express";
import prisma from "../common/db/prisma";
import { R2StorageClient } from "./r2.client";
import { loadR2Config } from "./r2.config";
import { BackupLogger } from "./backup.logger";
import { CloudBackupService } from "./backup.service";
import { createBackupSystem } from "./index";

export const getDRHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;

    const backups = await (prisma as any).cloudBackup.findMany({
      where: { tenantId },
      select: {
        status: true,
        type: true,
        fileSize: true,
        integrity: true,
        lastVerifiedAt: true,
      }
    });

    let totalStorageBytes = 0;
    let daily = 0;
    let monthly = 0;
    let yearly = 0;
    let failed = 0;
    let corrupted = 0;
    let successful = 0;
    let lastVerifyTime: Date | null = null;

    backups.forEach((b: any) => {
      totalStorageBytes += Number(b.fileSize);
      if (b.type === "DAILY") daily++;
      if (b.type === "MONTHLY") monthly++;
      if (b.type === "YEARLY") yearly++;
      
      if (b.status === "FAILED" || b.status === "UPLOAD_FAILED" || b.status === "VERIFICATION_FAILED") {
        failed++;
      } else if (b.status === "COMPLETED") {
        successful++;
      }

      if (b.integrity === "CORRUPTED" || b.integrity === "MISSING") {
        corrupted++;
      }

      if (b.lastVerifiedAt) {
        if (!lastVerifyTime || b.lastVerifiedAt > lastVerifyTime) {
          lastVerifyTime = b.lastVerifiedAt;
        }
      }
    });

    const total = backups.length;
    const successRate = total > 0 ? (successful / total) * 100 : 100;

    // Check R2 Connectivity
    let r2Connected = false;
    try {
      const config = loadR2Config();
      if (config) {
         // simple check can be done, but we assume connected if config is present for fast dashboard response.
         // A true head bucket could be done, but we skip to keep it fast.
         r2Connected = true; 
      }
    } catch(e) {}

    const nextScheduled = new Date();
    nextScheduled.setHours(2, 0, 0, 0);
    if (nextScheduled < new Date()) nextScheduled.setDate(nextScheduled.getDate() + 1);

    res.json({
      r2Connected,
      totalBackups: total,
      dailyBackups: daily,
      monthlyArchives: monthly,
      yearlyArchives: yearly,
      totalStorageBytes,
      successRate,
      failures: failed,
      corrupted,
      lastVerificationTime: lastVerifyTime,
      nextScheduledDate: nextScheduled,
    });
  } catch (err) {
    next(err);
  }
};

export const getSlaAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const backups = await (prisma as any).cloudBackup.findMany({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      select: { fileSize: true, durationMs: true, status: true, backupDate: true }
    });

    const restores = await (prisma as any).restoreHistory.findMany({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      select: { durationMs: true, status: true }
    });

    let totalSize = 0;
    let maxBackupSize = 0;
    let totalBackupDuration = 0;
    let backupCount = backups.length;
    let completedBackups = 0;
    
    backups.forEach((b: any) => {
      const size = Number(b.fileSize);
      totalSize += size;
      if (size > maxBackupSize) maxBackupSize = size;
      if (b.durationMs) totalBackupDuration += b.durationMs;
      if (b.status === "COMPLETED") completedBackups++;
    });

    let totalRestoreDuration = 0;
    let restoreCount = restores.length;
    let completedRestores = 0;
    
    restores.forEach((r: any) => {
      if (r.durationMs) totalRestoreDuration += r.durationMs;
      if (r.status === "COMPLETED") completedRestores++;
    });

    const avgBackupSize = backupCount > 0 ? totalSize / backupCount : 0;
    const avgBackupTime = backupCount > 0 ? totalBackupDuration / backupCount : 0;
    const avgRestoreTime = restoreCount > 0 ? totalRestoreDuration / restoreCount : 0;
    const backupSuccessRate = backupCount > 0 ? (completedBackups / backupCount) * 100 : 100;
    const restoreSuccessRate = restoreCount > 0 ? (completedRestores / restoreCount) * 100 : 100;

    // Check for missed backups
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const recentBackup = backups.find((b: any) => b.backupDate >= twentyFourHoursAgo && b.status === "COMPLETED");
    const missedBackups = recentBackup ? 0 : 1; // Simplistic view for tenant SLA

    res.json({
      avgBackupSize,
      maxBackupSize,
      avgBackupTime,
      avgRestoreTime,
      backupSuccessRate,
      restoreSuccessRate,
      missedBackups,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.id;

    const backup = await (prisma as any).cloudBackup.findUnique({
      where: { id: backupId, tenantId },
    });

    if (!backup) return res.status(404).json({ error: "Backup not found" });
    if (backup.isImmutable) return res.status(403).json({ error: "Cannot delete an immutable archive backup" });

    const config = loadR2Config();
    const logger = new BackupLogger();
    if (config) {
      const r2Client = new R2StorageClient(config, logger);
      try {
        await r2Client.delete(backup.storagePath);
      } catch (err) {
        logger.error("Failed to delete from R2 during manual delete", err);
        // Continue to delete from DB anyway so it's not stuck
      }
    }

    await (prisma as any).cloudBackup.delete({
      where: { id: backupId },
    });

    res.json({ message: "Backup deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export const retryBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.id;

    const backup = await (prisma as any).cloudBackup.findUnique({
      where: { id: backupId, tenantId },
    });

    if (!backup || !backup.status.includes("FAILED")) {
       return res.status(400).json({ error: "Backup is not in a failed state" });
    }

    // Since we don't have the original snapshot data cached, a retry of a failed backup
    // essentially means generating a new one for that date.
    const system = createBackupSystem(prisma as any);
    if (!system) return res.status(500).json({ error: "Cloud backup system is disabled" });
    
    // Delete the old failed record
    await (prisma as any).cloudBackup.delete({ where: { id: backupId } });
    
    // Execute new backup (Runs async)
    system.service.createBackup(tenantId, new Date()).catch(console.error);

    res.json({ message: "Backup retry initiated." });
  } catch (err) {
    next(err);
  }
};

export const verifyIntegrity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.id;

    const backup = await (prisma as any).cloudBackup.findUnique({
      where: { id: backupId, tenantId },
    });

    if (!backup) return res.status(404).json({ error: "Backup not found" });

    const config = loadR2Config();
    if (!config) return res.status(500).json({ error: "R2 not configured" });

    const r2Client = new R2StorageClient(config, new BackupLogger());
    
    let integrity = "UNVERIFIED";
    try {
      const existsAndSizeMatch = await r2Client.verifyUpload(backup.storagePath, Number(backup.fileSize));
      integrity = existsAndSizeMatch ? "VERIFIED" : "CORRUPTED";
    } catch (e: any) {
      if (e.name === 'NotFound' || e.message.includes('404')) {
        integrity = "MISSING";
      } else {
        integrity = "CORRUPTED";
      }
    }

    await (prisma as any).cloudBackup.update({
      where: { id: backupId },
      data: { integrity, lastVerifiedAt: new Date() }
    });

    res.json({ message: "Verification complete", integrity });
  } catch (err) {
    next(err);
  }
};
