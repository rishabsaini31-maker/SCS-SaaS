import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import { config } from "../config";
import type { SuperAdminTokenPayload } from "../utils/scsAdminJwt";
import { getActiveSession } from "../services/authSession";

export async function authenticateSuperAdmin(
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
  if (!token || !/^Bearer$/i.test(scheme)) return next();

  try {
    const payload = (jwt.verify(token, config.jwtSecret) as SuperAdminTokenPayload) || null;
    if (!payload?.adminId || !payload?.adminType) {
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

    (req as any).superAdmin = superAdmin;
  } catch (err) {
    // invalid token -> ignore here; requireSuperAdmin middleware will enforce if needed
  }

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
