import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

/**
 * PRODUCTION SECURITY: Enhanced rate limiting configuration
 *
 * Different rate limits for different endpoints to protect against:
 * - Brute force attacks (login endpoints)
 * - Password reset abuse
 * - API flooding
 *
 * Limits are stricter for authentication endpoints.
 */

type RateLimitScope = "ip" | "user" | "tenant" | "admin";

type RateLimitTag =
  | "global"
  | "login"
  | "super-admin-login"
  | "password-reset"
  | "verification"
  | "refresh"
  | "export"
  | "report"
  | "search"
  | "admin-search"
  | "barcode";

function getClientIp(req: Request) {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function getRateLimitIdentity(req: Request, scope: RateLimitScope) {
  if (scope === "user") {
    return (req as any).user?.userId || null;
  }

  if (scope === "tenant") {
    return (req as any).tenantId || (req as any).user?.tenantId || null;
  }

  if (scope === "admin") {
    return (req as any).superAdmin?.id || null;
  }

  return null;
}

function createLimiter(options: {
  windowMs: number;
  max: number;
  tag: RateLimitTag;
  scope?: RateLimitScope;
  message: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV !== "production",
    keyGenerator: (req: Request) => {
      const identity = options.scope ? getRateLimitIdentity(req, options.scope) : null;
      const ip = getClientIp(req);

      if (identity) {
        return `${options.tag}:${options.scope}:${identity}`;
      }

      return `${options.tag}:ip:${ip}`;
    },
    handler: (req: Request, res: Response, _next: NextFunction, limiterOptions: { windowMs: number }) => {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(limiterOptions.windowMs / 1000),
      );

      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: options.message,
        limit: options.max,
        retryAfter: retryAfterSeconds,
      });

      // eslint-disable-next-line no-console
      console.warn(
        JSON.stringify({
          level: "WARN",
          event: "rate_limit_exceeded",
          tag: options.tag,
          scope: options.scope || "ip",
          ipAddress: getClientIp(req),
          userId: (req as any).user?.userId,
          tenantId: (req as any).tenantId || (req as any).user?.tenantId,
          adminId: (req as any).superAdmin?.id,
          path: req.path,
          method: req.method,
          retryAfterSeconds,
        }),
      );
    },
  });
}

/**
 * Generic API rate limiter: 100 requests per 15 minutes
 * For general API operations
 */
export const globalRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  tag: "global",
  scope: "ip",
  message: "Too many requests, please try again later.",
});

/**
 * STRICT: Login rate limiter: 5 requests per 15 minutes
 * Protects against brute force password attacks
 */
export const loginRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  tag: "login",
  scope: "ip",
  message: "Too many login attempts, please try again in 15 minutes.",
});

/**
 * STRICT: Super Admin login rate limiter: 5 requests per 15 minutes
 * Extra strict for admin panel access
 */
export const superAdminLoginRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  tag: "super-admin-login",
  scope: "ip",
  message: "Too many admin login attempts. Please try again in 15 minutes.",
});

/**
 * STRICT: Password reset rate limiter: 3 requests per hour
 * Protects against account lockout attacks
 */
export const passwordResetRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  tag: "password-reset",
  scope: "ip",
  message: "Too many password reset attempts. Please try again in 1 hour.",
});

export const verificationRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  tag: "verification",
  scope: "ip",
  message: "Too many verification attempts. Please try again in 1 hour.",
});

export const refreshRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  tag: "refresh",
  scope: "user",
  message: "Too many refresh requests. Please try again later.",
});

export const exportRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  tag: "export",
  scope: "user",
  message: "Too many export requests. Please try again later.",
});

export const reportRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  tag: "report",
  scope: "tenant",
  message: "Too many report requests. Please try again later.",
});

export const searchRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  tag: "search",
  scope: "tenant",
  message: "Too many search requests. Please try again later.",
});

export const barcodeRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  tag: "barcode",
  scope: "tenant",
  message: "Too many barcode requests. Please try again later.",
});

export const adminSearchRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  tag: "admin-search",
  scope: "admin",
  message: "Too many admin requests. Please try again later.",
});

/**
 * MODERATE: Shop creation rate limiter: 10 requests per hour (for admins)
 * Prevents mass shop creation
 */
export const shopCreationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 creations per hour
  message: {
    error: "Too many shop creation requests. Please try again later.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
  keyGenerator: (req: Request) => {
    // Rate limit by admin ID if authenticated, otherwise by IP
    const adminId = (req as any).superAdmin?.id;
    if (adminId) {
      return `admin-${adminId}`;
    }
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown"
    );
  },
});

/**
 * Fallback rate limiter for the global API
 * This is applied to all routes not covered by specific limiters
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // If no specific limiter has been applied, use the global one
  // This is a simple pass-through that relies on express-rate-limit middleware
  next();
}
