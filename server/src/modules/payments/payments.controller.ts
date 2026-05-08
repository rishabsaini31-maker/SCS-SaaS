import type { Request, Response, NextFunction } from "express";
import * as service from "./payments.service";
import {
  createPaymentSchema,
  paymentIdSchema,
  updatePaymentSchema,
} from "./payments.schema";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const payment = await service.createPayment(data);
    res.status(201).json(payment);
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
    const { id } = paymentIdSchema.parse(req.params);
    const payment = await service.getPayment(id);
    res.json(payment);
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
    const { id } = paymentIdSchema.parse(req.params);
    const data = updatePaymentSchema.parse(req.body);
    const payment = await service.updatePayment(id, data);
    res.json(payment);
  } catch (err) {
    next(err);
  }
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
  } catch (err) {
    next(err);
  }
};
