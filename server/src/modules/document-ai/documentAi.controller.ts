import type { Request, Response, NextFunction } from "express";
import * as service from "./documentAi.service";
import { CustomError } from "../../common/errors/CustomError";

export const scanDocumentAi = async (
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
