import type { Request, Response, NextFunction } from "express";
import * as service from "./categories.service";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await service.getAllCategories(req.tenantId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const name = String(req.body?.name ?? "");
    const category = await service.createCategory(name, req.tenantId);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryName = decodeURIComponent(String(req.params.name ?? ""));
    const deletedCount = await service.deleteCategory(categoryName, req.tenantId);
    res.json({ deletedCount });
  } catch (err) {
    next(err);
  }
};
