import type { NextFunction, Request, Response } from "express";
import { scsAdminLoginSchema } from "./scs-auth.schema";
import * as service from "./scs-auth.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = scsAdminLoginSchema.parse(req.body);
    const result = await service.loginSuperAdmin(data);
    res.json(result);
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
