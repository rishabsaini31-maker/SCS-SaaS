import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { getDefaultTenantId } from "../tenant/defaultTenant";

export interface AuthPayload {
  userId?: string;
  tenantId?: string;
  role?: string;
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
      ((verifyFn as any).call(null, token, config.jwtSecret) as AuthPayload) ||
      {};
    const tenantId = payload.tenantId || (await getDefaultTenantId());
    // attach safely
    (req as any).user = {
      userId: payload.userId,
      tenantId,
      role: payload.role,
    };
    (req as any).tenantId = tenantId;
  } catch (err) {
    // invalid token -> ignore here; requireTenant middleware will enforce if needed
  }

  return next();
}
