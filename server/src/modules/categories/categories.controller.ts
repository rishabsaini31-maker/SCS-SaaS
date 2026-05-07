import type { Request, Response, NextFunction } from "express";
import * as service from "./categories.service";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await service.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};
