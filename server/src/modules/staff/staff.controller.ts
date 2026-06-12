import type { Request, Response, NextFunction } from "express";
import * as service from "./staff.service";
import { createStaffSchema, updateStaffSchema, resetPasswordSchema, toggleStatusSchema } from "./staff.schema";

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createStaffSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const adminId = req.user!.userId!;
    const staff = await service.createStaff(tenantId, data, adminId);
    res.status(201).json(staff);
  } catch (error) {
    next(error);
  }
};

export const getStaffList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const list = await service.getStaffList(tenantId);
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getStaffMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const metrics = await service.getStaffMetrics(tenantId);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

export const getStaffPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const performance = await service.getStaffPerformance(tenantId);
    res.json(performance);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateStaffSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const id = req.params.id as string;
    const updated = await service.updateStaff(tenantId, id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const id = req.params.id as string;
    const result = await service.resetStaffPassword(tenantId, id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = toggleStatusSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const id = req.params.id as string;
    const result = await service.toggleStaffStatus(tenantId, id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;
    const result = await service.deleteStaff(tenantId, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
