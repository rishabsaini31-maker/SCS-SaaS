import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../common/db/prisma";
import { logAuditEvent, AuditAction, AuditTargetType } from "../common/services/auditLog";
import { RestoreEngine, RestoreScope, ConflictHandling } from "./restore.engine";

export const getRestoreHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const history = await (prisma as any).restoreHistory.findMany({
      where: { tenantId },
      orderBy: { startedAt: 'desc' },
      include: {
        cloudBackup: {
          select: { fileName: true, backupDate: true }
        }
      }
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
};

export const previewRestore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.backupId as string;
    
    const engine = new RestoreEngine(prisma as any);
    const preview = await engine.preview(backupId, tenantId);
    
    res.json(preview);
  } catch (err) {
    next(err);
  }
};

export const triggerRestore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const backupId = req.params.backupId as string;
    const { password, scope, conflictHandling } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password confirmation is required." });
    }

    const tenant = await (prisma as any).tenant.findUnique({
      where: { id: tenantId },
      include: { owner: true }
    });

    if (!tenant || !tenant.owner) {
      return res.status(404).json({ error: "Tenant owner not found." });
    }

    // Verify Password
    const isValid = await bcrypt.compare(password, tenant.owner.password);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Create History Record
    const history = await (prisma as any).restoreHistory.create({
      data: {
        tenantId,
        cloudBackupId: backupId,
        scope: scope,
        conflictHandling: conflictHandling || "SKIP",
        startedBy: tenant.owner.id,
        status: "PENDING"
      }
    });

    // Audit Log
    await logAuditEvent({
      adminId: tenant.owner.id,
      action: AuditAction.SETTINGS_CHANGED, // Fallback for generic event
      targetType: AuditTargetType.TENANT,
      targetId: tenantId,
      metadata: { action: "CLOUD_BACKUP_RESTORE_TRIGGERED", backupId, restoreId: history.id, scope },
      ipAddress: req.ip
    });

    // Run Engine in background
    const engine = new RestoreEngine(prisma as any);
    engine.executeRestore(history.id, backupId, tenantId, scope as RestoreScope, conflictHandling as ConflictHandling)
      .catch(console.error);

    res.json({ message: "Restore process started.", restoreId: history.id });
  } catch (err) {
    next(err);
  }
};

export const getRestoreProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const restoreId = req.params.restoreId as string;

    const history = await (prisma as any).restoreHistory.findUnique({
      where: { id: restoreId, tenantId }
    });

    if (!history) {
      return res.status(404).json({ error: "Restore process not found." });
    }

    res.json({
      status: history.status,
      startedAt: history.startedAt,
      completedAt: history.completedAt,
      errorMessage: history.errorMessage,
      durationMs: history.durationMs
    });
  } catch (err) {
    next(err);
  }
};
