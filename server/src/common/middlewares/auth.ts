import { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "../utils/jwt";
import { getActiveSession } from "../services/authSession";
import { extractBearerToken, verifyJwtToken } from "../utils/jwtAuth";

export interface AuthPayload {
  userId?: string;
  tenantId?: string;
  role?: string;
  staffId?: string;
  [key: string]: any;
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

  if (payload.sessionId && (!payload.role || payload.role === "OWNER")) {
    const session = await getActiveSession(payload.sessionId);
    if (
      !session ||
      session.userId !== payload.userId ||
      session.tenantId !== payload.tenantId
    ) {
      return next();
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
