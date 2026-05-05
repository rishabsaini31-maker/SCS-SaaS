import { Request, Response, NextFunction } from "express";
import * as productsService from "./products.service";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await productsService.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};
