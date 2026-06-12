import "express";

declare module "express" {
  export interface Request {
    user?: {
      userId?: string;
      tenantId?: string;
      role?: string;
      staffId?: string;
    };
    tenantId?: string;
    superAdmin?: {
      id?: string;
      email?: string;
      adminType?: string;
      status?: string;
    };
  }
}
