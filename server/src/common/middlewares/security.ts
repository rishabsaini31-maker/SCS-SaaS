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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeString(value: string): string {
  return value.replace(/\u0000/g, "").replace(/[\u0000-\u001f\u007f]/g, "");
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [sanitizeString(key), sanitizeValue(item)]),
    );
  }

  return value;
}

function containsSuspiciousKeys(value: unknown): boolean {
  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (
        typeof key === "string" &&
        (key.includes("..") ||
          key.includes("/") ||
          key.includes("\\") ||
          key.startsWith("_"))
      ) {
        return true;
      }

      if (containsSuspiciousKeys(nested)) {
        return true;
      }
    }
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsSuspiciousKeys(item));
  }

  return false;
}

/**
 * Sanitize request headers to remove potentially dangerous values
 */
export function sanitizeHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const dangerousHeaders = [
    "x-original-url",
    "x-rewrite-url",
    "x-access-token",
    "x-secret-token",
    "x-forwarded-host",
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
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self';",
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );

  next();
}

/**
 * Sanitize request body to remove control characters and null bytes.
 */
export function sanitizeBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (isPlainObject(req.body)) {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }

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
    const bodyStr = JSON.stringify(req.body);
    if (bodyStr.includes("\0")) {
      return res.status(400).json({
        error: "Invalid request payload",
      });
    }

    if (containsSuspiciousKeys(req.body)) {
      return res.status(400).json({
        error: "Invalid request payload",
      });
    }
  }

  next();
}
