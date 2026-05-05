import type { Request, Response, NextFunction } from "express";
import * as service from "./ledger.service";

export const getCustomerLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    if (!customerId) throw new Error("Customer ID is required");
    const result = await service.getCustomerLedger(customerId);
    res.json(result);
  } catch (err) { next(err); }
};

export const getSupplierLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplierId = Array.isArray(req.params.supplierId) ? req.params.supplierId[0] : req.params.supplierId;
    if (!supplierId) throw new Error("Supplier ID is required");
    const result = await service.getSupplierLedger(supplierId);
    res.json(result);
  } catch (err) { next(err); }
};

export const listAllLedgers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getAllLedgers({
      entityType: req.query.entityType ? (Array.isArray(req.query.entityType) ? (req.query.entityType[0] as "customer" | "supplier") : (req.query.entityType as "customer" | "supplier")) : undefined,
    });
    res.json(result);
  } catch (err) { next(err); }
};
