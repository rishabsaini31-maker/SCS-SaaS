import type { Request, Response, NextFunction } from "express";
import * as service from "./auth.service";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

function getClientMetadata(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ipAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0]?.trim()
      : req.socket.remoteAddress || "unknown";

  const userAgent = req.get("user-agent") || "";
  const browser = /chrome|crios|safari|firefox|edg/i.test(userAgent)
    ? userAgent.match(/(chrome|crios|safari|firefox|edg)/i)?.[0] || "Unknown"
    : "Unknown";
  const operatingSystem = /windows/i.test(userAgent)
    ? "Windows"
    : /macintosh|mac os/i.test(userAgent)
      ? "macOS"
      : /android/i.test(userAgent)
        ? "Android"
        : /linux/i.test(userAgent)
          ? "Linux"
          : /iphone|ipad/i.test(userAgent)
            ? "iOS"
            : "Unknown";

  return { ipAddress, userAgent, browser, operatingSystem };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("auth-token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.cookie("refresh-token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await service.loginOwner(data, getClientMetadata(req));

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      user: result.user,
      tenant: result.tenant,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken =
      req.cookies?.["refresh-token"] || req.body?.refreshToken || req.body?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is required" });
    }

    const data = refreshTokenSchema.parse({ refreshToken });
    const result = await service.refreshOwnerToken(data, getClientMetadata(req));

    setAuthCookies(res, result.accessToken, result.refreshToken);

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
    const tenantId = req.user?.tenantId;
    const role = req.user?.role;
    const staffId = req.user?.staffId;

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.getCurrentSession(userId, tenantId, role, staffId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const refreshToken = req.cookies?.["refresh-token"] || req.body?.refreshToken || req.body?.refresh_token;
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : undefined;
    const result = await service.logoutOwner(userId, refreshToken, sessionId);

    res.clearCookie("auth-token", { path: "/" });
    res.clearCookie("refresh-token", { path: "/" });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.logoutAllOwnerSessions(userId);

    res.clearCookie("auth-token", { path: "/" });
    res.clearCookie("refresh-token", { path: "/" });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await service.forgotPassword(data, process.env.FRONTEND_URL);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await service.resetPassword(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const sendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await service.sendVerification({ email: data.email }, process.env.FRONTEND_URL);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await service.verifyEmail(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.listActiveSessions(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const revokeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    if (!userId || !sessionId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await service.revokeSession(userId, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const demoLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.loginDemoOwner();
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      user: result.user,
      tenant: result.tenant,
    });
  } catch (err) {
    next(err);
  }
};
