import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";

export const getCustomerLedger = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) throw new CustomError("Customer not found", 404);

  const entries = await prisma.ledgerEntry.findMany({
    where: { customerId },
    include: {
      invoice: { include: { lineItems: true } },
      payment: true,
      customer: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let balance = 0;
  const entriesWithBalance = entries.map((entry) => {
    if (entry.type === "debit") {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
    }
    return { ...entry, runningBalance: balance };
  });

  return {
    customer: { ...customer, currentBalance: customer.outstandingBalance },
    entries: entriesWithBalance,
    summary: {
      totalDebit: entries.filter((e) => e.type === "debit").reduce((sum, e) => sum + e.amount, 0),
      totalCredit: entries.filter((e) => e.type === "credit").reduce((sum, e) => sum + e.amount, 0),
      currentBalance: customer.outstandingBalance,
    },
  };
};

export const getSupplierLedger = async (supplierId: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });
  if (!supplier) throw new CustomError("Supplier not found", 404);

  const entries = await prisma.ledgerEntry.findMany({
    where: { supplierId },
    include: {
      purchase: { include: { lineItems: true } },
      payment: true,
      supplier: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let balance = 0;
  const entriesWithBalance = entries.map((entry) => {
    if (entry.type === "credit") {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
    }
    return { ...entry, runningBalance: balance };
  });

  return {
    supplier: { ...supplier, currentBalance: supplier.payableBalance },
    entries: entriesWithBalance,
    summary: {
      totalCredit: entries.filter((e) => e.type === "credit").reduce((sum, e) => sum + e.amount, 0),
      totalDebit: entries.filter((e) => e.type === "debit").reduce((sum, e) => sum + e.amount, 0),
      currentBalance: supplier.payableBalance,
    },
  };
};

export const getAllLedgers = async (filters?: {
  entityType?: "customer" | "supplier";
}) => {
  if (!filters?.entityType || filters.entityType === "customer") {
    return prisma.ledgerEntry.findMany({
      where: { customerId: { not: null } },
      include: {
        customer: true,
        invoice: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.ledgerEntry.findMany({
    where: { supplierId: { not: null } },
    include: {
      supplier: true,
      purchase: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
