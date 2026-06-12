import type { Request, Response, NextFunction } from "express";
import * as service from "./invoices.service";
import {
  createInvoiceSchema,
  invoiceIdSchema,
  updateInvoiceSchema,
} from "./invoices.schema";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const invoice = await service.createInvoice(data, req.tenantId, req.user);
    res.status(201).json(invoice);
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
    const { id } = invoiceIdSchema.parse(req.params);
    const invoice = await service.getInvoice(id, req.tenantId);
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const invoices = await service.getInvoices(
      {
        customerId,
        status,
        startDate,
        endDate,
      },
      req.tenantId,
    );
    res.json(invoices);
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
    const { id } = invoiceIdSchema.parse(req.params);
    const data = updateInvoiceSchema.parse(req.body);
    const invoice = await service.updateInvoice(id, data, req.tenantId);
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

export const listByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = Array.isArray(req.params.customerId)
      ? req.params.customerId[0]
      : req.params.customerId;
    if (!customerId) throw new Error("Customer ID is required");
    const invoices = await service.getInvoicesByCustomer(
      customerId,
      req.tenantId,
    );
    res.json(invoices);
  } catch (err) {
    next(err);
  }
};
