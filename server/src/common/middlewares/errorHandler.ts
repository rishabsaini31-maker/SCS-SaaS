import { Request, Response, NextFunction } from "express";

function redactSensitive(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]")
    .replace(/(token|password|secret|authorization)=([^&\s]+)/gi, "$1=[REDACTED]")
    .replace(/(["'])((?:token|password|secret|authorization))\1\s*:\s*(["']).*?\3/gi, "$1$2$1: '[REDACTED]'" );
}

function sanitizeForLog(value: unknown): unknown {
  if (typeof value === "string") {
    return redactSensitive(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitizeForLog(item)]),
    );
  }

  return value;
}

// PRODUCTION: Enhanced error logging and handling with context
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  const requestId = (req as any).requestId || "unknown";
  const startTime = (req as any).startTime;
  const duration = startTime ? Date.now() - startTime : "unknown";
  const tenantId = (req as any).tenant?.id || "system";
  const adminId = (req as any).superAdmin?.id || null;
  const userId = (req as any).user?.id || null;

  const errorLog = {
    requestId,
    timestamp: new Date().toISOString(),
    level: "ERROR",
    method: req.method,
    path: req.path,
    status,
    duration: typeof duration === "number" ? `${duration}ms` : duration,
    error: sanitizeForLog(message),
    tenantId: tenantId !== "system" ? tenantId : undefined,
    adminId,
    userId,
    stack: process.env.NODE_ENV === "production" ? undefined : sanitizeForLog(err.stack),
  };

  const cleanLog = Object.fromEntries(
    Object.entries(errorLog).filter(([, v]) => v !== undefined),
  );

  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${JSON.stringify(cleanLog)}`);

  const clientError =
    status >= 500
      ? { error: "Internal Server Error", requestId }
      : { error: sanitizeForLog(message), requestId };

  res.status(status).json(clientError);
}

