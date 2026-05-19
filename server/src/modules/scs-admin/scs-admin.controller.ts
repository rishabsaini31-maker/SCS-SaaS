import type { NextFunction, Request, Response } from "express";
import * as service from "./scs-admin.service";
import {
  createShopSchema,
  resetOwnerPasswordSchema,
  tenantIdParamSchema,
  tenantStatusSchema,
} from "./scs-admin.schema";

export async function dashboard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getDashboardMetrics();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listTenants();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createShop(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createShopSchema.parse(req.body);
    const result = await service.createShop(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tenantId } = tenantIdParamSchema.parse(req.params);
    const data = tenantStatusSchema.parse(req.body);
    const result = await service.updateTenantStatus(tenantId, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetOwnerPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tenantId } = tenantIdParamSchema.parse(req.params);
    const data = resetOwnerPasswordSchema.parse(req.body);
    const result = await service.resetTenantOwnerPassword(tenantId, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
