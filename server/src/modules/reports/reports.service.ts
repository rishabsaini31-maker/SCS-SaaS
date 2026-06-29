import prisma from "../../common/db/prisma";
import { tenantWhere } from "../../common/tenant/tenant.utils";

export const getSalesReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
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

export const getPurchaseReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
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

export const getSalesTeamReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
  const staffList = await prisma.staffUser.findMany({
    where: {
      ...tenantWhere(tenantId),
      role: "SALESMAN",
    },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  const performance = await Promise.all(
    staffList.map(async (staff) => {
      const invoices = await prisma.invoice.findMany({
        where: {
          ...tenantWhere(tenantId),
          createdByStaffId: staff.id,
          ...(startDate || endDate
            ? {
                invoiceDate: {
                  ...(startDate && { gte: new Date(startDate) }),
                  ...(endDate && { lte: new Date(endDate) }),
                },
              }
            : {}),
        },
      });

      return {
        id: staff.id,
        name: staff.name,
        isActive: staff.isActive,
        totalBills: invoices.length,
        totalSalesAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      };
    })
  );

  // Sort by total sales amount descending
  return performance.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);
};
