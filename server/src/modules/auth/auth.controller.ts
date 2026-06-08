import type { Request, Response, NextFunction } from "express";
import * as service from "./auth.service";
import { loginSchema } from "./auth.schema";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await service.loginOwner(data);
    
    // PRODUCTION SECURITY: Set HttpOnly cookie with JWT
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth-token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
    
    // Return user info but NOT the token (it's in the cookie now)
    res.json({
      user: result.user,
      tenant: result.tenant,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.getCurrentSession(userId, tenantId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * SECURITY: Logout endpoint with server-side session revocation
 *
 * Revokes all sessions for the authenticated user.
 * Frontend must clear the JWT token after receiving this response.
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.logoutOwner(userId);
    
    // PRODUCTION SECURITY: Clear HttpOnly cookie
    res.clearCookie("auth-token", { path: "/" });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const demoLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await service.loginDemoOwner();
    
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth-token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
    
    res.json({
      user: result.user,
      tenant: result.tenant,
    });
  } catch (err) {
    next(err);
  }
};
