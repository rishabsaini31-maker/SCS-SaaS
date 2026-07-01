import type { Request, Response, NextFunction } from "express";
import {
  queryAuthLogs,
  exportAuthLogsCsv,
} from "../../common/services/authAuditLog";
// lightweight date parsing without external dependency

export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const isSuperAdmin = Boolean((req as any).superAdmin?.id);
    const tenantId = isSuperAdmin ? req.query.tenantId?.toString() : (req as any).tenantId;
    const ownerId = req.query.ownerId?.toString();
    const staffId = req.query.staffId?.toString();
    const eventType = req.query.eventType?.toString();
    const status = req.query.status?.toString();
    const ipAddress = req.query.ipAddress?.toString();
    const deviceType = req.query.deviceType?.toString();
    const search = req.query.search?.toString();
    const page = parseInt(req.query.page as string || "1", 10);
    const perPage = Math.min(100, parseInt(req.query.perPage as string || "25", 10));

    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const skip = (page - 1) * perPage;

    const result = await queryAuthLogs({
      tenantId: tenantId as string | undefined,
      ownerId: ownerId || undefined,
      staffId: staffId || undefined,
      eventType: eventType || undefined,
      status: status || undefined,
      ipAddress: ipAddress || undefined,
      deviceType: deviceType || undefined,
      search: search || undefined,
      dateFrom,
      dateTo,
      skip,
      take: perPage,
    });

    res.json({ count: result.count, logs: result.rows, page, perPage });
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const isSuperAdmin = Boolean((req as any).superAdmin?.id);
    const tenantId = isSuperAdmin ? req.query.tenantId?.toString() : (req as any).tenantId;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const csv = await exportAuthLogsCsv({ tenantId: tenantId as string | undefined, dateFrom, dateTo });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="security-logs-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
