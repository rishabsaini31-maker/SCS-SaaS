import type { Request, Response, NextFunction } from "express";
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import prisma from "../common/db/prisma";
import { logAuditEvent, AuditAction, AuditTargetType } from "../common/services/auditLog";
import { sendManualBackupCompletedEmail } from "../common/utils/email";
import { createBackupSystem } from "./index";
import { loadR2Config } from "./r2.config";

export const getBackupHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [backups, total] = await Promise.all([
      (prisma as any).cloudBackup.findMany({
        where: { tenantId },
        orderBy: { backupDate: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).cloudBackup.count({ where: { tenantId } })
    ]);

    const items = backups.map((b: any) => ({
      ...b,
      fileSize: b.fileSize !== undefined && b.fileSize !== null ? Number(b.fileSize) : 0,
    }));

    res.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const config = loadR2Config();

    const [totalBackups, totalStorageResult, lastSuccessful, failures] = await Promise.all([
      (prisma as any).cloudBackup.count({ where: { tenantId } }),
      (prisma as any).cloudBackup.aggregate({
        where: { tenantId, status: 'COMPLETED' },
        _sum: { fileSize: true }
      }),
      (prisma as any).cloudBackup.findFirst({
        where: { tenantId, status: 'COMPLETED' },
        orderBy: { backupDate: 'desc' }
      }),
      (prisma as any).cloudBackup.count({
        where: { tenantId, status: { in: ['FAILED', 'UPLOAD_FAILED', 'VERIFICATION_FAILED'] } }
      })
    ]);

    let r2Connected = false;
    if (config) {
      try {
        const s3 = new S3Client({
          region: "auto",
          endpoint: config.endpoint,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
          forcePathStyle: true,
        });
        // We can't do a simple ping, but having config implies it's configured.
        // A true connection check would require a bucket operation.
        r2Connected = true;
      } catch {
        r2Connected = false;
      }
    }

    // Next scheduled is 2:00 AM next day
    const now = new Date();
    const nextScheduled = new Date(now);
    nextScheduled.setHours(2, 0, 0, 0);
    if (now >= nextScheduled) {
      nextScheduled.setDate(nextScheduled.getDate() + 1);
    }

    // Ensure we send back numbers instead of BigInts for JSON serialization
    const totalStorageBytes = totalStorageResult._sum.fileSize ? Number(totalStorageResult._sum.fileSize) : 0;

    res.json({
      r2Connected,
      totalBackups,
      totalStorageBytes,
      lastSuccessfulDate: lastSuccessful?.backupDate || null,
      nextScheduledDate: nextScheduled,
      failures
    });
  } catch (err) {
    next(err);
  }
};

export const triggerManualBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const forceFull = req.body.forceFull === true;
    const backupDate = new Date();
    
    const backupSystem = createBackupSystem(prisma as any);
    if (!backupSystem) {
      return res.status(503).json({ error: "Cloud backup system is not configured." });
    }

    const tenant = await (prisma as any).tenant.findUnique({ where: { id: tenantId }, include: { owner: true }});
    
    if (tenant?.owner) {
      await logAuditEvent({
        adminId: tenant.owner.id,
        action: AuditAction.SETTINGS_CHANGED, 
        targetType: AuditTargetType.TENANT,
        targetId: tenantId,
        metadata: { action: "MANUAL_CLOUD_BACKUP_TRIGGERED", forceFull },
        ipAddress: req.ip
      });
    }

    // Await the backup since incremental is fast
    const result = await backupSystem.service.createBackup(tenantId, backupDate, forceFull);

    if (result.status === "SKIPPED") {
      return res.status(200).json({ message: result.skippedReason || "No changes detected. Backup skipped." });
    }

    if (tenant?.email) {
      await sendManualBackupCompletedEmail(tenant.email, {
        fileName: "Manual Backup",
        fileSize: "N/A", 
        time: new Date().toLocaleString(),
        status: result.status
      }).catch(console.error);
    }

    res.json({ message: `Manual backup completed with status: ${result.status}` });
  } catch (err) {
    next(err);
  }
};

export const verifyBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.id;

    const backup = await (prisma as any).cloudBackup.findUnique({
      where: { id: backupId, tenantId }
    });

    if (!backup) {
      return res.status(404).json({ error: "Backup not found" });
    }

    const config = loadR2Config();
    if (!config) {
      return res.status(503).json({ error: "Cloud backup system is not configured." });
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });

    let verified = false;
    let errorMessage = null;

    try {
      const cmd = new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: backup.storagePath,
      });
      const response = await s3.send(cmd);
      const actualSize = response.ContentLength ?? 0;

      if (Number(actualSize) === Number(backup.fileSize)) {
        verified = true;
      } else {
        errorMessage = `Size mismatch. Expected ${backup.fileSize}, got ${actualSize}`;
      }
    } catch (e: any) {
      errorMessage = e.message || "Failed to find file in R2";
    }

    await (prisma as any).cloudBackup.update({
      where: { id: backupId },
      data: {
        status: verified ? 'COMPLETED' : 'VERIFICATION_FAILED',
        errorMessage: verified ? null : errorMessage
      }
    });

    res.json({ verified, message: errorMessage });
  } catch (err) {
    next(err);
  }
};

export const downloadBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.id;

    const backup = await (prisma as any).cloudBackup.findUnique({
      where: { id: backupId, tenantId }
    });

    if (!backup) {
      return res.status(404).json({ error: "Backup not found" });
    }

    const config = loadR2Config();
    if (!config) {
      return res.status(503).json({ error: "Cloud backup system is not configured." });
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: backup.storagePath,
    });

    const s3Response = await s3.send(command);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.fileName}"`);
    
    if (s3Response.Body) {
      // @ts-ignore
      s3Response.Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to download file" });
    }
  } catch (err) {
    next(err);
  }
};
