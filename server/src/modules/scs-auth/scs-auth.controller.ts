import type { NextFunction, Request, Response } from "express";
import { scsAdminLoginSchema } from "./scs-auth.schema";
import * as service from "./scs-auth.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = scsAdminLoginSchema.parse(req.body);
    const result = await service.loginSuperAdmin(data);
    
    // PRODUCTION SECURITY: Set HttpOnly cookie with JWT
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth-token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
    
    // Return admin info but NOT the token (it's in the cookie now)
    res.json({
      admin: result.admin,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).superAdmin?.id;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.getCurrentSuperAdmin(adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * SECURITY: Super admin logout with server-side session revocation
 *
 * Revokes all sessions for the authenticated super admin.
 * Frontend must clear the JWT token after receiving this response.
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).superAdmin?.id;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.logoutSuperAdmin(adminId);
    
    // PRODUCTION SECURITY: Clear HttpOnly cookie
    res.clearCookie("auth-token", { path: "/" });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}
