import type { Request, Response, NextFunction } from "express";
import * as service from "./purchases.service";
import {
  createPurchaseSchema,
  purchaseIdSchema,
  updatePurchaseSchema,
} from "./purchases.schema";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createPurchaseSchema.parse(req.body);
    const purchase = await service.createPurchase(data, req.tenantId);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = purchaseIdSchema.parse(req.params);
    const purchase = await service.getPurchase(id, req.tenantId);
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = purchaseIdSchema.parse(req.params);
    const data = updatePurchaseSchema.parse(req.body);
    const purchase = await service.updatePurchase(id, data, req.tenantId);
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchases = await service.getPurchases(
      {
        supplierId: req.query.supplierId as string | undefined,
        status: req.query.status as string | undefined,
      },
      req.tenantId,
    );
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};
