import type { Request, Response, NextFunction } from "express";
import * as service from "./payments.service";
import { createPaymentSchema } from "./payments.schema";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const payment = await service.createPayment(data);
    res.status(201).json(payment);
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new Error("ID is required");
    const payment = await service.getPayment(id);
    res.json(payment);
  } catch (err) { next(err); }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const supplierId = req.query.supplierId as string | undefined;
    const payments = await service.getPayments({
      customerId,
      supplierId,
    });
    res.json(payments);
  } catch (err) { next(err); }
};
