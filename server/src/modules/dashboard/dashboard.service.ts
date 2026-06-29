import prisma from "../../common/db/prisma";
import { tenantWhere } from "../../common/tenant/tenant.utils";

export const getDashboardMetrics = async (tenantId?: string) => {
  const where = tenantWhere(tenantId);

  const [salesAgg, purchasesAgg, productCount, lowStockCount, stockAgg, paymentAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where,
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.purchase.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.product.count({ where }),
    prisma.product.count({
      where: { ...where, stock: { lt: 10 } },
    }),
    prisma.product.aggregate({
      where,
      _sum: { stock: true },
    }),
    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return {
    totalSales: salesAgg._sum.totalAmount ?? 0,
    totalPurchases: purchasesAgg._sum.totalAmount ?? 0,
    outstanding: paymentAgg._sum.amount ?? 0,
    stockCount: stockAgg._sum.stock ?? 0,
    lowStockCount,
    invoiceCount: salesAgg._count,
    productCount,
  };
};
