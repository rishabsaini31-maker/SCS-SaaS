import type { Request, Response, NextFunction } from "express";
import * as service from "./invoices.service";
import { createInvoiceSchema } from "./invoices.schema";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const invoice = await service.createInvoice(data);
    res.status(201).json(invoice);
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new Error("ID is required");
    const invoice = await service.getInvoice(id);
    res.json(invoice);
  } catch (err) { next(err); }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const status = req.query.status as string | undefined;
    const invoices = await service.getInvoices({
      customerId,
      status,
    });
    res.json(invoices);
  } catch (err) { next(err); }
};

export const listByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    if (!customerId) throw new Error("Customer ID is required");
    const invoices = await service.getInvoicesByCustomer(customerId);
    res.json(invoices);
  } catch (err) { next(err); }
};
