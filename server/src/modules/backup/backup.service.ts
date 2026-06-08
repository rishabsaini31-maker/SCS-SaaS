import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";

export const getBackupsList = async (tenantId: string) => {
  return prisma.backup.findMany({
    where: { tenantId },
    select: {
      id: true,
      type: true,
      year: true,
      month: true,
      createdAt: true,
      updatedAt: true,
      data: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });
};

export const getBackupById = async (id: string, tenantId: string) => {
  const backup = await prisma.backup.findFirst({
    where: { id, tenantId },
  });
  if (!backup) {
    throw new CustomError("Backup not found", 404);
  }
  return backup;
};

export const createMonthlyBackup = async (
  tenantId: string,
  year: number,
  month: number,
  force: boolean = false,
) => {
  if (month < 1 || month > 12) {
    throw new CustomError("Invalid month", 400);
  }

  // Check if already exists
  const existing = await prisma.backup.findFirst({
    where: { tenantId, type: "MONTHLY", year, month },
  });

  if (existing && !force) {
    return existing;
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Fetch Invoices (Sales)
  const invoices = await prisma.invoice.findMany({
    where: { tenantId, invoiceDate: { gte: startDate, lte: endDate } },
    include: {
      lineItems: {
        include: {
          product: { select: { name: true } },
        },
      },
      customer: { select: { name: true } },
    },
  });

  // Fetch Products (Inventory)
  const products = await prisma.product.findMany({
    where: { tenantId },
  });

  // Fetch Customers
  const customers = await prisma.customer.findMany({
    where: { tenantId },
  });

  // Fetch Suppliers
  const suppliers = await prisma.supplier.findMany({
    where: { tenantId },
  });

  // Fetch Payments
  const payments = await prisma.payment.findMany({
    where: { tenantId, paymentDate: { gte: startDate, lte: endDate } },
    include: {
      customer: { select: { name: true } },
      supplier: { select: { name: true } },
    },
  });

  // Fetch Purchases (Orders)
  const purchases = await prisma.purchase.findMany({
    where: { tenantId, purchaseDate: { gte: startDate, lte: endDate } },
    include: {
      lineItems: true,
      supplier: { select: { name: true } },
    },
  });

  const summary = {
    totalSales: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    salesCount: invoices.length,
    totalPurchases: purchases.reduce((sum, pur) => sum + pur.totalAmount, 0),
    purchasesCount: purchases.length,
    paymentsReceived: payments.filter((p) => p.customerId).reduce((sum, p) => sum + p.amount, 0),
    paymentsPaid: payments.filter((p) => p.supplierId).reduce((sum, p) => sum + p.amount, 0),
    totalCustomers: customers.length,
    totalSuppliers: suppliers.length,
    activeProductsCount: products.length,
  };

  const snapshot = {
    summary,
    sales: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      totalAmount: inv.totalAmount,
      status: inv.status,
      customerName: inv.customer?.name || "Unknown Customer",
      lineItems: inv.lineItems.map((li) => ({
        productName: li.product?.name || "Unknown Product",
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        totalPrice: li.totalPrice,
      })),
    })),
    inventory: products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      stock: p.stock,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
    })),
    customers: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      outstandingBalance: c.outstandingBalance,
    })),
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      payableBalance: s.payableBalance,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      amount: p.amount,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      partyName: p.customer?.name || p.supplier?.name || "Unknown Party",
      type: p.customerId ? "Customer Receipt" : "Supplier Payment",
    })),
    orders: purchases.map((pur) => ({
      id: pur.id,
      purchaseNumber: pur.purchaseNumber,
      purchaseDate: pur.purchaseDate,
      totalAmount: pur.totalAmount,
      status: pur.status,
      supplierName: pur.supplier?.name || "Unknown Supplier",
      lineItems: pur.lineItems.map((li) => ({
        productName: li.productName || "Unknown Product",
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        totalPrice: li.totalPrice,
      })),
    })),
  };

  if (existing) {
    await prisma.backup.updateMany({
      where: { id: existing.id, tenantId },
      data: { data: snapshot as any },
    });
    const updated = await prisma.backup.findFirst({
      where: { id: existing.id, tenantId },
    });
    if (!updated) throw new CustomError("Backup not found", 404);
    return updated;
  }

  return prisma.backup.create({
    data: {
      tenantId,
      type: "MONTHLY",
      year,
      month,
      data: snapshot as any,
    },
  });
};

export const createYearlyBackup = async (
  tenantId: string,
  year: number,
  force: boolean = false,
) => {
  // Check if already exists
  const existing = await prisma.backup.findFirst({
    where: { tenantId, type: "YEARLY", year, month: null },
  });

  if (existing && !force) {
    return existing;
  }

  // Fetch all monthly backups for this year
  const monthlyBackups = await prisma.backup.findMany({
    where: { tenantId, type: "MONTHLY", year },
  });

  const monthsData: Record<number, any> = {};
  let totalSales = 0;
  let salesCount = 0;
  let totalPurchases = 0;
  let purchasesCount = 0;
  let paymentsReceived = 0;
  let paymentsPaid = 0;

  for (const mb of monthlyBackups) {
    if (mb.month) {
      monthsData[mb.month] = mb.data;
      const summary = (mb.data as any)?.summary || {};
      totalSales += summary.totalSales || 0;
      salesCount += summary.salesCount || 0;
      totalPurchases += summary.totalPurchases || 0;
      purchasesCount += summary.purchasesCount || 0;
      paymentsReceived += summary.paymentsReceived || 0;
      paymentsPaid += summary.paymentsPaid || 0;
    }
  }

  const summary = {
    totalSales,
    salesCount,
    totalPurchases,
    purchasesCount,
    paymentsReceived,
    paymentsPaid,
    monthsWithData: Object.keys(monthsData).length,
  };

  const snapshot = {
    summary,
    months: monthsData,
  };

  if (existing) {
    await prisma.backup.updateMany({
      where: { id: existing.id, tenantId },
      data: { data: snapshot as any },
    });
    const updated = await prisma.backup.findFirst({
      where: { id: existing.id, tenantId },
    });
    if (!updated) throw new CustomError("Backup not found", 404);
    return updated;
  }

  return prisma.backup.create({
    data: {
      tenantId,
      type: "YEARLY",
      year,
      month: null,
      data: snapshot as any,
    },
  });
};
