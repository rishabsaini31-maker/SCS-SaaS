import type { Request, Response, NextFunction } from "express";

/**
 * Audit context attached to requests for logging
 * PRODUCTION SECURITY: Captures IP and user agent for all actions
 */
export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
  adminId?: string;
}

declare global {
  namespace Express {
    interface Request {
      auditContext?: AuditContext;
    }
  }
}

/**
 * Middleware to extract and attach audit context to all requests
 *
 * Captures:
 * - IP address (for rate limiting and forensic analysis)
 * - User Agent (for device/browser tracking)
 * - Admin ID (from authenticated super admin)
 *
 * PRODUCTION SECURITY: This runs on all requests to provide context
 * for audit logging without blocking performance.
 */
export function auditContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const userAgent = (req.headers["user-agent"] || "unknown") as string;

  const adminId = (req as any).superAdmin?.id;

  req.auditContext = {
    ipAddress,
    userAgent,
    adminId,
  };

  next();
}
