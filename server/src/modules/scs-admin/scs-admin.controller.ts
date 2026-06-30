import type { NextFunction, Request, Response } from "express";
import * as service from "./scs-admin.service";
import {
  createShopSchema,
  resetOwnerPasswordSchema,
  tenantIdParamSchema,
  tenantStatusSchema,
  updateShopSchema,
} from "./scs-admin.schema";
import {
  logAuditEvent,
  AuditAction,
  AuditTargetType,
} from "../../common/services/auditLog";

export async function dashboard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getDashboardMetrics();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listTenants();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createShop(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createShopSchema.parse(req.body);
    const result = await service.createShop(data);

    // AUDIT LOG: Tenant creation
    if ((req as any).superAdmin?.id && result.tenant?.id) {
      await logAuditEvent({
        adminId: (req as any).superAdmin.id,
        action: AuditAction.TENANT_CREATED,
        targetType: AuditTargetType.TENANT,
        targetId: result.tenant.id,
        metadata: {
          businessName: data.businessName,
          ownerEmail: data.email,
          phone: data.phone,
        },
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
      });
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateShop(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tenantId } = tenantIdParamSchema.parse(req.params);
    const data = updateShopSchema.parse(req.body);
    const result = await service.updateTenant(tenantId, data);

    // AUDIT LOG: Tenant updated
    if ((req as any).superAdmin?.id && result.tenant?.id) {
      await logAuditEvent({
        adminId: (req as any).superAdmin.id,
        action: AuditAction.TENANT_UPDATED,
        targetType: AuditTargetType.TENANT,
        targetId: result.tenant.id,
        metadata: {
          updatedFields: Object.keys(data),
        },
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tenantId } = tenantIdParamSchema.parse(req.params);
    const data = tenantStatusSchema.parse(req.body);
    const result = await service.updateTenantStatus(tenantId, data);

    // AUDIT LOG: Tenant status change (suspension, reactivation, etc.)
    if ((req as any).superAdmin?.id) {
      const actionMap: Record<string, AuditAction> = {
        SUSPENDED: AuditAction.TENANT_SUSPENDED,
        ACTIVE: AuditAction.TENANT_REACTIVATED,
      };

      const action = actionMap[data.status] || AuditAction.SETTINGS_CHANGED;

      await logAuditEvent({
        adminId: (req as any).superAdmin.id,
        action,
        targetType: AuditTargetType.TENANT,
        targetId: tenantId,
        metadata: {
          newStatus: data.status,
          reason: (data as any).reason,
        },
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetOwnerPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tenantId } = tenantIdParamSchema.parse(req.params);
    const data = resetOwnerPasswordSchema.parse(req.body);
    const result = await service.resetTenantOwnerPassword(tenantId, data);

    // AUDIT LOG: Password reset
    if ((req as any).superAdmin?.id) {
      await logAuditEvent({
        adminId: (req as any).superAdmin.id,
        action: AuditAction.OWNER_PASSWORD_RESET,
        targetType: AuditTargetType.USER,
        targetId: result?.owner?.id,
        metadata: {
          tenantId,
          ownerEmail: result?.owner?.email,
          resetReason: (data as any).reason,
        },
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMySessions(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).superAdmin.id;
    const result = await service.getMySessions(adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function revokeSession(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).superAdmin.id;
    const sessionId = req.params.sessionId as string;
    const result = await service.revokeSession(adminId, sessionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
