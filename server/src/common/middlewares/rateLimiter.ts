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

/**
 * Generic API rate limiter: 100 requests per 15 minutes
 * For general API operations
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV !== "production",
  keyGenerator: (req: Request) => {
    // Use X-Forwarded-For for reverse proxies, fallback to socket remote address
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown"
    );
  },
});

/**
 * STRICT: Login rate limiter: 5 requests per 15 minutes
 * Protects against brute force password attacks
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    error: "Too many login attempts, please try again in 15 minutes.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for successful requests (optional, requires custom logic)
    // For now, we rate limit all attempts
    return false;
  },
  keyGenerator: (req: Request) => {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown"
    );
  },
});

/**
 * STRICT: Super Admin login rate limiter: 3 requests per 15 minutes
 * Extra strict for admin panel access
 */
export const superAdminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts only
  message: {
    error: "Too many admin login attempts. Please try again in 15 minutes.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
  keyGenerator: (req: Request) => {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown"
    );
  },
});

/**
 * STRICT: Password reset rate limiter: 3 requests per hour
 * Protects against account lockout attacks
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    error: "Too many password reset attempts. Please try again in 1 hour.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by IP for password resets
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown"
    );
  },
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
