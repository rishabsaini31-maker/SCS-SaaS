import { Prisma } from "@prisma/client";
import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { tenantWhere } from "../../common/tenant/tenant.utils";
import { runSerializableTransaction } from "../../common/db/transaction";
import type { CreateCashTransactionInput } from "./pota-baki.schema";

const IN_TYPES = new Set([
  "CASH_SALE",
  "CUSTOMER_PAYMENT",
  "LOAN_RECEIVED",
  "BANK_WITHDRAWAL",
  "OTHER",
]);

const OUT_TYPES = new Set([
  "EXPENSE",
  "ANGADIYA_PAYMENT",
  "STAFF_CASH_TAKEN",
  "OWNER_WITHDRAWAL",
  "PERSONAL_EXPENSE",
  "TEMPORARY_CASH_ADVANCE",
  "LOAN_GIVEN",
  "BANK_DEPOSIT",
]);

export const getDirectionForType = (type: string): "IN" | "OUT" => {
  if (IN_TYPES.has(type)) return "IN";
  if (OUT_TYPES.has(type)) return "OUT";
  throw new CustomError(`Invalid cash transaction type: ${type}`, 400);
};

export const getTodayDateStr = (): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

export const getTodayDate = (): Date => {
  const todayStr = getTodayDateStr();
  return new Date(`${todayStr}T00:00:00.000Z`);
};

export const getOrCreateTodayCashBook = async (
  tenantId: string,
  tx: any = prisma,
): Promise<any> => {
  const todayDate = getTodayDate();

  // 0. Auto-close any older OPEN cash books
  await tx.cashBook.updateMany({
    where: {
      tenantId,
      status: "OPEN",
      date: { lt: todayDate },
    },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  // 1. Search today's CashBook for tenant
  let cashBook = await tx.cashBook.findUnique({
    where: {
      tenantId_date: {
        tenantId,
        date: todayDate,
      },
    },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (cashBook) {
    return cashBook;
  }

  // 2. If not found: Find latest CLOSED CashBook for tenant
  const latestClosed = await tx.cashBook.findFirst({
    where: {
      tenantId,
      status: "CLOSED",
    },
    orderBy: {
      date: "desc",
    },
  });

  const openingBalance = latestClosed ? latestClosed.closingBalance : new Prisma.Decimal(0);

  // 3. Create new OPEN CashBook
  try {
    cashBook = await tx.cashBook.create({
      data: {
        tenantId,
        date: todayDate,
        openingBalance,
        totalCashIn: new Prisma.Decimal(0),
        totalCashOut: new Prisma.Decimal(0),
        closingBalance: openingBalance,
        status: "OPEN",
      },
      include: {
        transactions: true,
      },
    });
    return cashBook;
  } catch (error: any) {
    // Handle concurrent requests trying to create the same daily record
    if (error.code === "P2002") {
      cashBook = await tx.cashBook.findUnique({
        where: {
          tenantId_date: {
            tenantId,
            date: todayDate,
          },
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (cashBook) return cashBook;
    }
    throw error;
  }
};

export const createCashTransaction = async (
  tenantId: string,
  input: CreateCashTransactionInput,
): Promise<any> => {
  return runSerializableTransaction(async (tx) => {
    // Find today's CashBook (creating if not exists)
    const cashBook = await getOrCreateTodayCashBook(tenantId, tx);

    // Verify status = OPEN
    if (cashBook.status !== "OPEN") {
      throw new CustomError("Today's cash book is closed. Reopen it to add transactions.", 400);
    }

    const direction = getDirectionForType(input.type);
    const amount = new Prisma.Decimal(input.amount);

    // Create the transaction
    const transaction = await tx.cashTransaction.create({
      data: {
        tenantId,
        cashBookId: cashBook.id,
        type: input.type,
        direction,
        amount,
        description: input.description,
        personName: input.personName,
        mobile: input.mobile,
        purpose: input.purpose,
        expectedReturnDate: input.expectedReturnDate ? new Date(input.expectedReturnDate) : null,
      },
    });

    // Recalculate totals and closing balance
    const updatedTransactions = await tx.cashTransaction.findMany({
      where: { cashBookId: cashBook.id, tenantId },
    });

    let totalCashIn = new Prisma.Decimal(0);
    let totalCashOut = new Prisma.Decimal(0);

    for (const t of updatedTransactions) {
      if (t.direction === "IN") {
        totalCashIn = totalCashIn.add(t.amount);
      } else {
        totalCashOut = totalCashOut.add(t.amount);
      }
    }

    const closingBalance = new Prisma.Decimal(cashBook.openingBalance).add(totalCashIn).sub(totalCashOut);

    // Update cash book
    await tx.cashBook.update({
      where: { id: cashBook.id },
      data: {
        totalCashIn,
        totalCashOut,
        closingBalance,
      },
    });

    return transaction;
  });
};

export const deleteCashTransaction = async (
  tenantId: string,
  transactionId: string,
): Promise<void> => {
  return runSerializableTransaction(async (tx) => {
    const transaction = await tx.cashTransaction.findFirst({
      where: { id: transactionId, tenantId },
    });

    if (!transaction) {
      throw new CustomError("Transaction not found", 404);
    }

    const cashBook = await tx.cashBook.findUnique({
      where: { id: transaction.cashBookId },
    });

    if (!cashBook || cashBook.status !== "OPEN") {
      throw new CustomError("Cannot delete transaction from a closed or missing cash book", 400);
    }

    // Delete the transaction
    await tx.cashTransaction.delete({
      where: { id: transactionId },
    });

    // Recalculate totals
    const updatedTransactions = await tx.cashTransaction.findMany({
      where: { cashBookId: cashBook.id, tenantId },
    });

    let totalCashIn = new Prisma.Decimal(0);
    let totalCashOut = new Prisma.Decimal(0);

    for (const t of updatedTransactions) {
      if (t.direction === "IN") {
        totalCashIn = totalCashIn.add(t.amount);
      } else {
        totalCashOut = totalCashOut.add(t.amount);
      }
    }

    const closingBalance = new Prisma.Decimal(cashBook.openingBalance).add(totalCashIn).sub(totalCashOut);

    await tx.cashBook.update({
      where: { id: cashBook.id },
      data: {
        totalCashIn,
        totalCashOut,
        closingBalance,
      },
    });
  });
};

export const closeTodayCashBook = async (tenantId: string): Promise<any> => {
  return runSerializableTransaction(async (tx) => {
    const cashBook = await getOrCreateTodayCashBook(tenantId, tx);

    if (cashBook.status === "CLOSED") {
      throw new CustomError("Today's cash book is already closed", 400);
    }

    return tx.cashBook.update({
      where: { id: cashBook.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });
  });
};

export const reopenTodayCashBook = async (
  tenantId: string,
  userId: string,
): Promise<any> => {
  return runSerializableTransaction(async (tx) => {
    const cashBook = await getOrCreateTodayCashBook(tenantId, tx);

    if (cashBook.status === "OPEN") {
      throw new CustomError("Today's cash book is already open", 400);
    }

    const updated = await tx.cashBook.update({
      where: { id: cashBook.id },
      data: {
        status: "OPEN",
        closedAt: null,
      },
    });

    // Create Audit Log
    await tx.cashBookAuditLog.create({
      data: {
        tenantId,
        cashBookId: cashBook.id,
        userId,
        action: "REOPEN_CASH_BOOK",
      },
    });

    return updated;
  });
};

export const recordAutoPaymentTransaction = async (
  tx: any,
  params: {
    tenantId: string;
    customerId?: string;
    supplierId?: string;
    invoiceId?: string;
    purchaseId?: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  },
): Promise<void> => {
  if (params.paymentMethod.toLowerCase() !== "cash") {
    return;
  }

  // Get or create today's cash book
  const cashBook = await getOrCreateTodayCashBook(params.tenantId, tx);

  if (cashBook.status !== "OPEN") {
    throw new CustomError("Today's cash book is closed. Reopen it to record cash transactions.", 400);
  }

  let type: any;
  let direction: "IN" | "OUT";
  let description = params.notes || "";
  let personName = "General";

  if (params.customerId) {
    if (params.invoiceId) {
      type = "CASH_SALE";
      direction = "IN";
      description = description || `Cash Sale payment for Invoice`;
    } else {
      type = "CUSTOMER_PAYMENT";
      direction = "IN";
      description = description || `Customer payment received`;
    }
    const customer = await tx.customer.findUnique({
      where: { id: params.customerId },
      select: { name: true },
    });
    personName = customer?.name || "Customer";
  } else if (params.supplierId) {
    type = "EXPENSE";
    direction = "OUT";
    description = description || `Cash Purchase payment`;
    const supplier = await tx.supplier.findUnique({
      where: { id: params.supplierId },
      select: { name: true },
    });
    personName = supplier?.name || "Supplier";
  } else {
    return;
  }

  const amount = new Prisma.Decimal(params.amount);

  // Create cash transaction
  await tx.cashTransaction.create({
    data: {
      tenantId: params.tenantId,
      cashBookId: cashBook.id,
      type,
      direction,
      amount,
      description,
      personName,
    },
  });

  // Update totals
  const updatedTransactions = await tx.cashTransaction.findMany({
    where: { cashBookId: cashBook.id, tenantId: params.tenantId },
  });

  let totalCashIn = new Prisma.Decimal(0);
  let totalCashOut = new Prisma.Decimal(0);

  for (const t of updatedTransactions) {
    if (t.direction === "IN") {
      totalCashIn = totalCashIn.add(t.amount);
    } else {
      totalCashOut = totalCashOut.add(t.amount);
    }
  }

  const closingBalance = new Prisma.Decimal(cashBook.openingBalance).add(totalCashIn).sub(totalCashOut);

  await tx.cashBook.update({
    where: { id: cashBook.id },
    data: {
      totalCashIn,
      totalCashOut,
      closingBalance,
    },
  });
};

export const getTodayCashBook = async (tenantId: string): Promise<any> => {
  return getOrCreateTodayCashBook(tenantId);
};

export const getCashBookHistory = async (tenantId: string): Promise<any[]> => {
  return prisma.cashBook.findMany({
    where: { tenantId },
    orderBy: { date: "desc" },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const getDailyReport = async (tenantId: string): Promise<any[]> => {
  return prisma.cashBook.findMany({
    where: { tenantId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      openingBalance: true,
      totalCashIn: true,
      totalCashOut: true,
      closingBalance: true,
      status: true,
    },
  });
};

export const getMonthlyReport = async (
  tenantId: string,
  month: number,
  year: number,
): Promise<any> => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const cashBooks = await prisma.cashBook.findMany({
    where: {
      tenantId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      transactions: true,
    },
  });

  let totalCashIn = new Prisma.Decimal(0);
  let totalCashOut = new Prisma.Decimal(0);
  let totalStaffCashTaken = new Prisma.Decimal(0);
  let totalOwnerWithdrawals = new Prisma.Decimal(0);
  let totalAngadiyaPayments = new Prisma.Decimal(0);

  let highestClosingBalance = new Prisma.Decimal(0);
  let lowestClosingBalance = cashBooks[0]?.closingBalance ?? new Prisma.Decimal(0);
  let sumClosingBalance = new Prisma.Decimal(0);


  for (const cb of cashBooks) {
    totalCashIn = totalCashIn.add(cb.totalCashIn);
    totalCashOut = totalCashOut.add(cb.totalCashOut);

    if (cb.closingBalance.gt(highestClosingBalance)) {
      highestClosingBalance = cb.closingBalance;
    }
    if (cb.closingBalance.lt(lowestClosingBalance)) {
      lowestClosingBalance = cb.closingBalance;
    }
    sumClosingBalance = sumClosingBalance.add(cb.closingBalance);

    for (const tx of cb.transactions) {
      if (tx.type === "STAFF_CASH_TAKEN" || tx.type === "TEMPORARY_CASH_ADVANCE") {
        totalStaffCashTaken = totalStaffCashTaken.add(tx.amount);
      } else if (tx.type === "OWNER_WITHDRAWAL" || tx.type === "PERSONAL_EXPENSE") {
        totalOwnerWithdrawals = totalOwnerWithdrawals.add(tx.amount);
      } else if (tx.type === "ANGADIYA_PAYMENT") {
        totalAngadiyaPayments = totalAngadiyaPayments.add(tx.amount);
      }
    }
  }

  const averageDailyCash = cashBooks.length > 0
    ? sumClosingBalance.div(cashBooks.length)
    : new Prisma.Decimal(0);

  return {
    totalCashIn,
    totalCashOut,
    totalStaffCashTaken,
    totalOwnerWithdrawals,
    totalAngadiyaPayments,
    highestClosingBalance,
    lowestClosingBalance,
    averageDailyCash,
  };
};

export const updateOpeningBalance = async (
  tenantId: string,
  openingBalance: number,
): Promise<any> => {
  return runSerializableTransaction(async (tx) => {
    const cashBook = await getOrCreateTodayCashBook(tenantId, tx);

    if (cashBook.status !== "OPEN") {
      throw new CustomError("Cannot update opening balance of a closed cash book", 400);
    }

    const opBal = new Prisma.Decimal(openingBalance);
    const closingBalance = opBal.add(cashBook.totalCashIn).sub(cashBook.totalCashOut);

    return tx.cashBook.update({
      where: { id: cashBook.id },
      data: {
        openingBalance: opBal,
        closingBalance,
      },
    });
  });
};

export const getPreviousDayClosing = async (
  tenantId: string,
  targetDate: Date,
  tx: any = prisma,
): Promise<number> => {
  const previousCashBook = await tx.cashBook.findFirst({
    where: {
      tenantId,
      date: { lt: targetDate },
      status: "CLOSED",
    },
    orderBy: {
      date: "desc",
    },
  });
  return previousCashBook ? Number(previousCashBook.closingBalance) : 0;
};

export const getCashBookByDate = async (
  tenantId: string,
  dateStr: string,
): Promise<any> => {
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
  const todayStr = getTodayDateStr();
  
  if (dateStr === todayStr) {
    return getOrCreateTodayCashBook(tenantId);
  }
  
  const cashBook = await prisma.cashBook.findUnique({
    where: {
      tenantId_date: {
        tenantId,
        date: targetDate,
      },
    },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  
  return cashBook;
};
