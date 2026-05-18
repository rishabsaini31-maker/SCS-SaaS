import type { NextFunction, Request, Response } from "express";
import * as service from "./settings.service";
import { updateTenantSettingsSchema } from "./settings.schema";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getTenantSettings(req.tenantId);
    res.json(result);
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
    const data = updateTenantSettingsSchema.parse(req.body);
    const result = await service.updateTenantSettings(req.tenantId, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const businessProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await service.getBusinessProfile(req.tenantId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
