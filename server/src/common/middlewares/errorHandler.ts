import { Request, Response, NextFunction } from "express";

// PRODUCTION: Enhanced error logging and handling with context
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Extract context for logging
  const requestId = (req as any).requestId || "unknown";
  const startTime = (req as any).startTime;
  const duration = startTime ? Date.now() - startTime : "unknown";
  const tenantId = (req as any).tenant?.id || "system";
  const adminId = (req as any).superAdmin?.id || null;
  const userId = (req as any).user?.id || null;

  // Log error with full context for debugging
  const errorLog = {
    requestId,
    timestamp: new Date().toISOString(),
    level: "ERROR",
    method: req.method,
    url: req.url,
    status,
    duration: typeof duration === "number" ? `${duration}ms` : duration,
    error: message,
    tenantId: tenantId !== "system" ? tenantId : undefined,
    adminId,
    userId,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  };

  // Filter out undefined fields
  const cleanLog = Object.fromEntries(
    Object.entries(errorLog).filter(([, v]) => v !== undefined),
  );

  // Always log errors
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${JSON.stringify(cleanLog)}`);

  // Send client response (don't expose stack trace in production)
  const clientError =
    status >= 500
      ? { error: "Internal Server Error", requestId }
      : { error: message };

  res.status(status).json(clientError);
}
