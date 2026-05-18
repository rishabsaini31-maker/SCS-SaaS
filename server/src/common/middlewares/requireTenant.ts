import type { Request, Response, NextFunction } from "express";

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  const tenantId = user?.tenantId;
  if (!tenantId) {
    return res.status(403).json({ error: "Tenant context required" });
  }
  (req as any).tenantId = tenantId;
  next();
}

export default requireTenant;
