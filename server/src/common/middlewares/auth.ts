import { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "../utils/jwt";
import { getActiveSession } from "../services/authSession";
import { touchSession } from "../services/authSession";
import { extractBearerToken, verifyJwtToken } from "../utils/jwtAuth";

export interface AuthPayload {
  userId?: string;
  tenantId?: string;
  role?: string;
  staffId?: string;
  [key: string]: any;
}

/**
 * SLIDING WINDOW THROTTLE: In-memory cache to avoid touching the DB
 * on every single request. We only update lastSeenAt/expiresAt once per hour.
 */
const sessionTouchCache = new Map<string, number>();
const TOUCH_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

function shouldTouchSession(sessionId: string): boolean {
  const lastTouch = sessionTouchCache.get(sessionId);
  const now = Date.now();

  if (!lastTouch || now - lastTouch > TOUCH_THROTTLE_MS) {
    sessionTouchCache.set(sessionId, now);
    return true;
  }

  return false;
}

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // PRODUCTION SECURITY: Check cookie first, fall back to Bearer token
  let token = (req.cookies as any)?.["auth-token"];
  
  if (!token) {
    token = extractBearerToken(req.headers.authorization);
  }
  
  if (!token) return next();

  const payload = verifyJwtToken<AuthTokenPayload>(token);
  if (!payload?.userId || !payload.tenantId) {
    return next();
  }

  // In production enforce presence of sessionId to enable server-side revocation
  if (process.env.NODE_ENV === "production" && !payload.sessionId) {
    return next();
  }

  if (payload.sessionId) {
    const session = await getActiveSession(payload.sessionId);
    if (
      !session ||
      session.userId !== payload.userId ||
      session.tenantId !== payload.tenantId
    ) {
      return next();
    }

    if (shouldTouchSession(payload.sessionId)) {
      touchSession(payload.sessionId).catch(() => {
        sessionTouchCache.delete(payload.sessionId!);
      });
    }
  }

  req.user = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role || "OWNER",
    staffId: payload.staffId,
  };
  req.tenantId = payload.tenantId;

  return next();
}

