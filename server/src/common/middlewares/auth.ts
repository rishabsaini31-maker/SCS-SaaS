import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AuthTokenPayload } from "../utils/jwt";

export interface AuthPayload {
  userId?: string;
  tenantId?: string;
  [key: string]: any;
}

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return next();

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return next();

  const scheme = parts[0] as string;
  const token = parts[1] as string;
  if (!token) return next();
  if (!/^Bearer$/i.test(scheme)) return next();

  try {
    const verifyFn: any = (jwt as any).verify;
    const payload =
      ((verifyFn as any).call(
        null,
        token,
        config.jwtSecret,
      ) as AuthTokenPayload) || null;

    if (!payload?.userId || !payload.tenantId) {
      return next();
    }

    (req as any).user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
    };
    (req as any).tenantId = payload.tenantId;
  } catch (err) {
    // invalid token -> ignore here; requireTenant middleware will enforce if needed
  }

  return next();
}
