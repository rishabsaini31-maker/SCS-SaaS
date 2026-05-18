import type { Request, Response, NextFunction } from "express";
import * as service from "./tenant.service";
import { createTenantSchema, tenantIdSchema } from "./tenant.schema";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createTenantSchema.parse(req.body);
    const tenant = await service.createTenant(data);
    res.status(201).json(tenant);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenants = await service.getTenants();
    res.json(tenants);
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
    const { id } = tenantIdSchema.parse(req.params);
    const tenant = await service.getTenantById(id);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};
