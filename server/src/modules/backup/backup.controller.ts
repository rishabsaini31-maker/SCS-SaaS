import type { Request, Response, NextFunction } from "express";
import prisma from "../../common/db/prisma";
import * as service from "./backup.service";

export const listBackups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backups = await service.getBackupsList(req.tenantId!);
    res.json(backups);
  } catch (err) {
    next(err);
  }
};

export const getBackupById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const backup = await service.getBackupById(id as string, req.tenantId!);
    res.json(backup);
  } catch (err) {
    next(err);
  }
};

export const triggerManualBackup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type, year, month, force } = req.body;

    if (type === "MONTHLY" && year && month) {
      const backup = await service.createMonthlyBackup(
        req.tenantId!,
        Number(year),
        Number(month),
        force === true,
      );
      res.json({ message: "Monthly backup triggered successfully", backup });
    } else if (type === "YEARLY" && year) {
      const backup = await service.createYearlyBackup(
        req.tenantId!,
        Number(year),
        force === true,
      );
      res.json({ message: "Yearly backup triggered successfully", backup });
    } else {
      // Run the sync check for this tenant specifically
      console.log(`[BackupController] Triggering manual backup sync for tenant: ${req.tenantId}`);

      const tenant = await prisma.tenant.findUnique({
        where: { id: req.tenantId! },
      });

      if (!tenant) {
        res.status(404).json({ error: "Tenant not found" });
        return;
      }

      const startYear = tenant.createdAt.getFullYear();
      const startMonth = tenant.createdAt.getMonth() + 1;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      let checkYear = startYear;
      let checkMonth = startMonth;
      const created: any[] = [];

      while (
        checkYear < currentYear ||
        (checkYear === currentYear && checkMonth < currentMonth)
      ) {
        const b = await service.createMonthlyBackup(tenant.id, checkYear, checkMonth);
        created.push({ type: "MONTHLY", year: checkYear, month: checkMonth, id: b.id });
        checkMonth++;
        if (checkMonth > 12) {
          checkMonth = 1;
          checkYear++;
        }
      }

      let checkYearForYearly = startYear;
      while (checkYearForYearly < currentYear) {
        const b = await service.createYearlyBackup(tenant.id, checkYearForYearly);
        created.push({ type: "YEARLY", year: checkYearForYearly, id: b.id });
        checkYearForYearly++;
      }

      res.json({ message: "Sync complete", created });
    }
  } catch (err) {
    next(err);
  }
};
