import type { Request, Response, NextFunction } from "express";
import * as service from "./suppliers.service";
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierIdSchema,
} from "./suppliers.schema";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createSupplierSchema.parse(req.body);
    const supplier = await service.createSupplier(data);
    res.status(201).json(supplier);
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
    const { id } = supplierIdSchema.parse(req.params);
    const supplier = await service.getSupplier(id);
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suppliers = await service.getSuppliers({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json(suppliers);
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
    const { id } = supplierIdSchema.parse(req.params);
    const data = updateSupplierSchema.parse(req.body);
    const supplier = await service.updateSupplier(id, data);
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

export const deleteSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = supplierIdSchema.parse(req.params);
    await service.deleteSupplier(id);
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    next(err);
  }
};

export const getLedger = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = supplierIdSchema.parse(req.params);
    const result = await service.getSupplierLedger(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getRecentItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = supplierIdSchema.parse(req.params);
    const items = await service.getSupplierRecentItems(id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};
