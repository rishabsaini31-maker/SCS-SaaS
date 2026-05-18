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
    res.json(result);
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
