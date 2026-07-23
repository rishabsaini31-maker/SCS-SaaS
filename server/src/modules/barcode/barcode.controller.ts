import { Request, Response, NextFunction } from "express";
import * as service from "./barcode.service";
import {
  generateBarcodeSchema,
  getBarcodeParamsSchema,
  printDataSchema,
  updatePrintingConfigSchema,
  printTsplSchema,
} from "./barcode.schema";
import { CustomError } from "../../common/errors/CustomError";

export const generate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = generateBarcodeSchema.parse(req.body);
    const result = await service.generateBarcodeForProduct(
      parsed.productId,
      req.tenantId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = getBarcodeParamsSchema.parse(req.params);
    const result = await service.getBarcodeForProduct(
      parsed.productId,
      req.tenantId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const printData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = printDataSchema.parse(req.body);
    const result = await service.generatePrintData({
      ...parsed,
      tenantId: req.tenantId,
    });
    res.json({ labels: result });
  } catch (err) {
    if (err instanceof CustomError) return next(err);
    next(err);
  }
};

export const getPrintingConfig = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await service.getPrintingConfig(req.tenantId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updatePrintingConfig = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = updatePrintingConfigSchema.parse(req.body);
    const result = await service.updatePrintingConfig(req.tenantId, parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const printTspl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = printTsplSchema.parse(req.body);
    const result = await service.generateTsplData({
      ...parsed,
      tenantId: req.tenantId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
