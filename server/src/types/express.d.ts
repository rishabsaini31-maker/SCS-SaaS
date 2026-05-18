import "express";

declare module "express" {
  export interface Request {
    user?: {
      userId?: string;
      tenantId?: string;
      role?: string;
    };
    tenantId?: string;
  }
}
