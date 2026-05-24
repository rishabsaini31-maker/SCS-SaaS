import { AsyncLocalStorage } from "node:async_hooks";

type TenantContextState = {
  tenantId?: string;
};

const tenantContextStorage = new AsyncLocalStorage<TenantContextState>();

export function runWithTenantContext<T>(tenantId: string, fn: () => T): T {
  return tenantContextStorage.run({ tenantId }, fn);
}

export function getCurrentTenantId() {
  return tenantContextStorage.getStore()?.tenantId;
}