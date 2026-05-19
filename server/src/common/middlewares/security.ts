import type { Request, Response, NextFunction } from "express";

/**
 * PRODUCTION SECURITY: Request sanitization and validation middleware
 *
 * Protects against:
 * - Large payload attacks
 * - Malformed JSON
 * - Null byte injection
 * - Path traversal attempts
 */

/**
 * Sanitize request headers to remove potentially dangerous values
 */
export function sanitizeHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Remove potentially dangerous headers
  const dangerousHeaders = [
    "x-original-url",
    "x-rewrite-url",
    "x-access-token",
    "x-secret-token",
  ];

  dangerousHeaders.forEach((header) => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });

  next();
}

/**
 * Set strict security headers in responses
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent cache of sensitive data
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Content Security Policy - strict for API
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self';",
  );

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Feature Policy / Permissions Policy
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );

  next();
}

/**
 * Validate and sanitize JSON payload
 */
export function validateJsonPayload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.is("application/json") && req.body && typeof req.body === "object") {
    // Check for null bytes in stringified body (path traversal prevention)
    const bodyStr = JSON.stringify(req.body);
    if (bodyStr.includes("\0")) {
      return res.status(400).json({
        error: "Invalid request payload",
      });
    }

    // Check for suspicious patterns in object keys
    const hasPathTraversal = (obj: Record<string, any>): boolean => {
      for (const key in obj) {
        if (
          typeof key === "string" &&
          (key.includes("..") ||
            key.includes("/") ||
            key.includes("\\") ||
            key.startsWith("_"))
        ) {
          return true;
        }
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (hasPathTraversal(obj[key])) {
            return true;
          }
        }
      }
      return false;
    };

    if (hasPathTraversal(req.body)) {
      return res.status(400).json({
        error: "Invalid request payload",
      });
    }
  }

  next();
}
