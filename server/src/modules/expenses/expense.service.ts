import { Prisma } from "@prisma/client";
import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { runSerializableTransaction } from "../../common/db/transaction";
import { getOrCreateTodayCashBook } from "../pota-baki/pota-baki.service";
import type { CreateExpenseInput } from "./expense.schema";

export const createExpense = async (
  tenantId: string,
  input: CreateExpenseInput,
  user: { id?: string; name?: string; role?: string }
): Promise<any> => {
  return runSerializableTransaction(async (tx) => {
    const amount = new Prisma.Decimal(input.amount);
    
    // Only CASH expenses affect the Pota Baki ledger
    let cashBook: any = null;
    if (input.paymentMode === "CASH") {
      cashBook = await getOrCreateTodayCashBook(tenantId, tx);

      if (cashBook.status !== "OPEN") {
        throw new CustomError("Today's cash book is closed. Reopen it to add cash expenses.", 400);
      }

      if (new Prisma.Decimal(cashBook.closingBalance).lt(amount)) {
        throw new CustomError("Insufficient cash balance for this expense.", 400);
      }
    }

    // Create Expense record
    const expense = await tx.expense.create({
      data: {
        tenantId,
        category: input.category,
        customCategory: input.customCategory,
        amount: input.amount,
        reason: input.reason,
        notes: input.notes,
        paymentMode: input.paymentMode,
        paymentAccount: input.paymentAccount,
        createdBy: user.name || user.id,
      },
    });

    if (input.paymentMode === "CASH") {
      // Create associated CashTransaction
      await tx.cashTransaction.create({
        data: {
          tenantId,
          cashBookId: cashBook.id,
          type: "EXPENSE",
          direction: "OUT",
          amount,
          description: `[${input.category}] ${input.reason}` + (input.notes ? ` - ${input.notes}` : ""),
          personName: user.name || user.id,
          purpose: "Expense",
          expenseId: expense.id,
        },
      });

      // Recalculate CashBook totals
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

      // Audit log
      await tx.cashBookAuditLog.create({
        data: {
          tenantId,
          cashBookId: cashBook.id,
          userId: user.id || "system",
          action: `Recorded Cash Expense of ${input.amount} for ${input.reason}`,
        },
      });
    } else if (input.paymentAccount) {
      // Logic for reducing bank/UPI account balance can go here if we link payment accounts by ID.
      // E.g., find PaymentAccount by name/id and update balance.
    }

    return expense;
  });
};

export const getExpensesByDate = async (tenantId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.expense.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getExpensesForMonth = async (tenantId: string, year: number, month: number) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  return prisma.expense.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

