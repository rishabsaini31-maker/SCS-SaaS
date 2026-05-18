import type { Request, Response, NextFunction } from "express";
import * as service from "./products.service";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from "./products.schema";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await service.createProduct(data, req.tenantId);
    res.status(201).json(product);
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
    const { id } = productIdSchema.parse(req.params);
    const product = await service.getProduct(id, req.tenantId);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await service.getAllProducts(
      {
        category: req.query.category as string | undefined,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
        barcode: req.query.barcode as string | undefined,
      },
      req.tenantId,
    );
    res.json(products);
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
    const { id } = productIdSchema.parse(req.params);
    const data = updateProductSchema.parse(req.body);
    const product = await service.updateProduct(id, data, req.tenantId);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    await service.deleteProduct(id, req.tenantId);
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

export const getLowStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const threshold = req.query.threshold
      ? parseInt(req.query.threshold as string)
      : 10;
    const products = await service.getLowStockProducts(threshold, req.tenantId);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const suggest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = (req.query.q as string) || (req.query.query as string) || "";
    const suggestions = await service.getProductSuggestions(q, req.tenantId);
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
};

export const activate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const { sellingPrice } = req.body;
    if (sellingPrice === undefined || sellingPrice === null) {
      res.status(400).json({ error: "sellingPrice is required" });
      return;
    }
    const product = await service.activateProduct(
      id,
      parseFloat(sellingPrice),
      req.tenantId,
    );
    res.json(product);
  } catch (err) {
    next(err);
  }
};
