import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getCurrentTenantId } from "../tenant/tenantContext";
import { config } from "../config";

const TENANT_SCOPED_MODELS = new Set([
  "Product",
  "Customer",
  "Supplier",
  "Invoice",
  "InvoiceLineItem",
  "Purchase",
  "PurchaseLineItem",
  "Payment",
  "LedgerEntry",
  "TenantSetting",
  "User",
  "AuthSession",
]);

function mergeTenantWhere(where: any, tenantId: string) {
  if (!where) {
    return { tenantId };
  }

  return {
    AND: [where, { tenantId }],
  };
}

function normalizeTenantData(data: any, tenantId: string): any {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeTenantData(item, tenantId));
  }

  if (!data || typeof data !== "object") {
    return data;
  }

  if (Object.prototype.hasOwnProperty.call(data, "tenantId")) {
    const existingTenantId = (data as { tenantId?: string }).tenantId;
    if (existingTenantId && existingTenantId !== tenantId) {
      throw new Error("Tenant isolation violation");
    }
  }

  return {
    ...data,
    tenantId,
  };
}

function scopeTenantArgs(operation: string, args: any, tenantId: string) {
  switch (operation) {
    case "findUnique":
      return {
        ...args,
        where: {
          ...(args?.where || {}),
          tenantId,
        },
      };
    case "findUniqueOrThrow":
      return {
        ...args,
        where: {
          ...(args?.where || {}),
          tenantId,
        },
      };
    case "findFirst":
    case "findFirstOrThrow":
    case "findMany":
    case "count":
    case "aggregate":
    case "groupBy":
      return {
        ...args,
        where: mergeTenantWhere(args?.where, tenantId),
      };
    case "create":
      return {
        ...args,
        data: normalizeTenantData(args?.data, tenantId),
      };
    case "createMany":
      return {
        ...args,
        data: normalizeTenantData(args?.data, tenantId),
      };
    case "updateMany":
    case "deleteMany":
      return {
        ...args,
        where: mergeTenantWhere(args?.where, tenantId),
      };
    default:
      return args;
  }
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 1,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = getCurrentTenantId();

        if (!tenantId || !model || !TENANT_SCOPED_MODELS.has(model)) {
          return query(args);
        }

        return query(scopeTenantArgs(operation, args, tenantId));
      },
    },
  },
});

export default prisma;
