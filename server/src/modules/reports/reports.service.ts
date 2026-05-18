import prisma from "../../common/db/prisma";
import { tenantWhere } from "../../common/tenant/tenant.utils";

export const getSalesReport = async (tenantId?: string, startDate?: string, endDate?: string) => {
  return prisma.invoice.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(startDate || endDate
        ? {
            invoiceDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    },
    include: { customer: true, lineItems: { include: { product: true } } },
    orderBy: { invoiceDate: "desc" },
  });
};

export const getPurchaseReport = async (tenantId?: string, startDate?: string, endDate?: string) => {
  return prisma.purchase.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(startDate || endDate
        ? {
            purchaseDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    },
    include: { supplier: true, lineItems: { include: { product: true } } },
    orderBy: { purchaseDate: "desc" },
  });
};

export const getStockReport = async (tenantId?: string) => {
  return prisma.product.findMany({
    where: tenantWhere(tenantId),
    orderBy: { updatedAt: "desc" },
  });
};
