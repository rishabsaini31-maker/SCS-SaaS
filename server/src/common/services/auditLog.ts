import prisma from "../db/prisma";

export enum AuditAction {
  TENANT_CREATED = "TENANT_CREATED",
  TENANT_SUSPENDED = "TENANT_SUSPENDED",
  TENANT_REACTIVATED = "TENANT_REACTIVATED",
  OWNER_PASSWORD_RESET = "OWNER_PASSWORD_RESET",
  SETTINGS_CHANGED = "SETTINGS_CHANGED",
  SUPER_ADMIN_LOGIN = "SUPER_ADMIN_LOGIN",
  TENANT_OWNER_LOGIN = "TENANT_OWNER_LOGIN",
  INVALID_LOGIN_ATTEMPT = "INVALID_LOGIN_ATTEMPT",
  SESSION_REVOKED = "SESSION_REVOKED",
}

export enum AuditTargetType {
  TENANT = "TENANT",
  USER = "USER",
  SETTING = "SETTING",
  SESSION = "SESSION",
  ADMIN = "ADMIN",
}

export interface AuditLogParams {
  adminId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an administrative action for security and compliance tracking.
 *
 * PRODUCTION SECURITY: All Super Admin actions are logged with context
 * including IP address and user agent for forensic analysis.
 *
 * @param params - Audit log parameters
 * @returns Created audit log entry
 */
export async function logAuditEvent(params: AuditLogParams) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    return auditLog;
  } catch (error) {
    // Log audit errors but don't block operations
    // eslint-disable-next-line no-console
    console.error("Failed to create audit log:", error);
    return null;
  }
}

/**
 * Get audit logs for a specific admin
 */
export async function getAdminAuditLogs(adminId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get audit logs for a specific tenant
 */
export async function getTenantAuditLogs(tenantId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: {
      targetType: AuditTargetType.TENANT,
      targetId: tenantId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get recent suspicious activities (invalid login attempts, etc.)
 */
export async function getSuspiciousActivities(limit = 50) {
  return prisma.auditLog.findMany({
    where: {
      action: {
        in: [AuditAction.INVALID_LOGIN_ATTEMPT],
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get audit logs for a date range
 */
export async function getAuditLogsByDateRange(
  startDate: Date,
  endDate: Date,
  limit = 500,
) {
  return prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
