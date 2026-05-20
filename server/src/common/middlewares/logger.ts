import { Request, Response, NextFunction } from "express";

// PRODUCTION: Enhanced request logging with context and timing
export function logger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Store request metadata for error handlers
  (req as any).requestId = requestId;
  (req as any).startTime = startTime;

  // Capture response end to log status and duration
  const originalEnd = res.end.bind(res);
  (res.end as any) = function (...args: any[]) {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    // Extract context
    const tenantId = (req as any).tenant?.id || "system";
    const adminId = (req as any).superAdmin?.id || null;
    const userId = (req as any).user?.id || null;

    // Log sensitive operations
    const isSensitiveOperation =
      req.method !== "GET" || req.url.includes("/auth");
    const logLevel =
      status >= 400 ? "ERROR" : isSensitiveOperation ? "WARN" : "DEBUG";

    // Construct log message
    const logContext = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status,
      duration: `${duration}ms`,
      tenantId: tenantId !== "system" ? tenantId : undefined,
      adminId,
      userId,
    };

    // Filter out undefined fields
    const logEntry = Object.fromEntries(
      Object.entries(logContext).filter(([, v]) => v !== undefined),
    );

    // Output appropriate log level
    const logMessage = JSON.stringify(logEntry);
    if (logLevel === "ERROR") {
      console.error(`[${logLevel}] ${logMessage}`);
    } else if (logLevel === "WARN") {
      console.warn(`[${logLevel}] ${logMessage}`);
    } else {
      console.debug(`[${logLevel}] ${logMessage}`);
    }

    // Call original end with proper arguments
    return originalEnd(...args);
  };

  next();
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
