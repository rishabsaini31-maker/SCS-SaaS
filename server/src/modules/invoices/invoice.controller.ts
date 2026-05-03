import { Request, Response, NextFunction } from "express";
import { createInvoiceService } from "./invoice.service";
import { invoiceSchema } from "./invoice.schema";
import { AppError } from "../../common/errors/AppError";

export async function createInvoiceController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = invoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Validation failed", 400, parsed.error.flatten());
    }
    const invoice = await createInvoiceService(parsed.data);
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}
