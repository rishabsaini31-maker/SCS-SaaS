import prisma from "../../common/db/prisma";
import { tenantWhere } from "../../common/tenant/tenant.utils";

export const getDashboardMetrics = async (tenantId?: string) => {
  const [invoices, purchases, products, payments] = await Promise.all([
    prisma.invoice.findMany({ where: tenantWhere(tenantId) }),
    prisma.purchase.findMany({ where: tenantWhere(tenantId) }),
    prisma.product.findMany({ where: tenantWhere(tenantId) }),
    prisma.payment.findMany({ where: tenantWhere(tenantId) }),
  ]);

  const totalSales = invoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0,
  );
  const totalPurchases = purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0,
  );
  const outstanding = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const lowStockCount = products.filter((product) => product.stock < 10).length;

  return {
    totalSales,
    totalPurchases,
    outstanding,
    stockCount: products.reduce((sum, product) => sum + product.stock, 0),
    lowStockCount,
  };
};
