import type { NextFunction, Request, Response } from "express";
import prisma from "../db/prisma";
import type { SuperAdminTokenPayload } from "../utils/scsAdminJwt";
import { getActiveSession } from "../services/authSession";
import { extractBearerToken, verifyJwtToken } from "../utils/jwtAuth";

export async function authenticateSuperAdmin(
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

  const payload = verifyJwtToken<SuperAdminTokenPayload>(token);
  if (!payload?.adminId || !payload?.adminType) {
    return next();
  }

  // In production require sessionId for server-side revocation support
  if (process.env.NODE_ENV === "production" && !payload.sessionId) {
    return next();
  }

  if (payload.sessionId) {
    const session = await getActiveSession(payload.sessionId);
    if (!session || session.superAdminId !== payload.adminId) {
      return next();
    }
  }

  const superAdmin = await prisma.superAdmin.findFirst({
    where: {
      id: payload.adminId,
      adminType: payload.adminType,
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      adminType: true,
      status: true,
    },
  });

  if (!superAdmin) {
    return next();
  }

  req.superAdmin = superAdmin;

  return next();
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const superAdmin = (req as any).superAdmin;
  if (!superAdmin?.id) {
    return res.status(403).json({ error: "Super admin context required" });
  }
  next();
}
