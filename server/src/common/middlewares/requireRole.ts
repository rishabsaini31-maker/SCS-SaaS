import type { Request, Response, NextFunction } from "express";

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    next();
  };
}

export const requireOwner = requireRole(["OWNER"]);
export const requireSalesman = requireRole(["SALESMAN"]);
export const requireOwnerOrSalesman = requireRole(["OWNER", "SALESMAN"]);
