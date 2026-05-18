import type { NextFunction, Request, Response } from "express";
import * as service from "./dashboard.service";

export const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await service.getDashboardMetrics(req.tenantId);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
};
