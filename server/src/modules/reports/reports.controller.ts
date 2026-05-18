import type { NextFunction, Request, Response } from "express";
import * as service from "./reports.service";

export const sales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getSalesReport(
      req.tenantId,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const purchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getPurchaseReport(
      req.tenantId,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const stock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getStockReport(req.tenantId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
