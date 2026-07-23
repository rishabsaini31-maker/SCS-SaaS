import type { Request, Response, NextFunction } from "express";
import * as service from "./billScanner.service";
import { CustomError } from "../../common/errors/CustomError";

export const scanBill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) {
      throw new CustomError("No file uploaded. Supported formats: PDF, JPG, PNG, WEBP, HEIC", 400);
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new CustomError("File size exceeds 20 MB limit", 400);
    }

    const result = await service.processAndMatchInvoice(
      file.buffer,
      file.mimetype,
      file.originalname,
      req.tenantId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const checkDuplicate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supplierGstin, invoiceNumber } = req.body;
    if (!invoiceNumber) {
      res.json({ isDuplicate: false });
      return;
    }
    res.json({ isDuplicate: false });
  } catch (err) {
    next(err);
  }
};

export const saveMapping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supplierItemName, productId, supplierId } = req.body;
    await service.saveSupplierMapping(
      supplierItemName,
      productId,
      supplierId,
      req.tenantId
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
