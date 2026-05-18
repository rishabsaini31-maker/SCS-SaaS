import type { Request, Response, NextFunction } from "express";
import * as service from "./customers.service";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
} from "./customers.schema";
import { CustomError } from "../../common/errors/CustomError";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createCustomerSchema.parse(req.body);
    const customer = await service.createCustomer(data, req.tenantId);
    res.status(201).json(customer);
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
    const { id } = customerIdSchema.parse(req.params);
    const customer = await service.getCustomer(id, req.tenantId);
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await service.getCustomers(
      {
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
      },
      req.tenantId,
    );
    res.json(customers);
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
    const { id } = customerIdSchema.parse(req.params);
    const data = updateCustomerSchema.parse(req.body);
    const customer = await service.updateCustomer(id, data, req.tenantId);
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = customerIdSchema.parse(req.params);
    await service.deleteCustomer(id, req.tenantId);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
};

export const getLedger = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = customerIdSchema.parse(req.params);
    const result = await service.getCustomerLedger(id, req.tenantId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
