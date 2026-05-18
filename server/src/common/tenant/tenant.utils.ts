import { CustomError } from "../errors/CustomError";
import type {
  TenantCreateData,
  TenantId,
  TenantRequest,
  TenantWhere,
} from "./tenant.types";

export function getTenantId(
  req?: Pick<TenantRequest, "tenantId" | "user">,
): TenantId | undefined {
  return req?.tenantId || req?.user?.tenantId;
}

export function tenantWhere<T extends Record<string, unknown>>(
  tenantId: TenantId | undefined,
  where: T = {} as T,
): TenantWhere<T> {
  return tenantId ? { ...where, tenantId } : where;
}

export function tenantCreateData<T extends Record<string, unknown>>(
  tenantId: TenantId | undefined,
  data: T,
): TenantCreateData<T> {
  return (tenantId ? { ...data, tenantId } : data) as TenantCreateData<T>;
}

export function assertTenantOwnership(
  currentTenantId: TenantId | undefined,
  recordTenantId: TenantId | null | undefined,
  entityName: string = "Record",
) {
  if (currentTenantId && recordTenantId && recordTenantId !== currentTenantId) {
    throw new CustomError(`${entityName} not found`, 404);
  }
}
