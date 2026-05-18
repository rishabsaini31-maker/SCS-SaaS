import type { Request } from "express";

export type TenantId = string;

export interface TenantUserContext {
  userId?: string;
  tenantId?: TenantId;
  role?: string;
}

export interface TenantRequest extends Request {
  tenantId?: TenantId;
  user?: TenantUserContext;
}

export type TenantWhere<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  tenantId?: TenantId;
};

export type TenantCreateData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  tenantId?: TenantId;
};
