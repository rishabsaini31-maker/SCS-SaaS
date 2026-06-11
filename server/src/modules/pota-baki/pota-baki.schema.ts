import { z } from "zod";

export const createCashTransactionSchema = z.object({
  type: z.enum([
    "CASH_SALE",
    "CUSTOMER_PAYMENT",
    "EXPENSE",
    "ANGADIYA_PAYMENT",
    "STAFF_CASH_TAKEN",
    "OWNER_WITHDRAWAL",
    "PERSONAL_EXPENSE",
    "TEMPORARY_CASH_ADVANCE",
    "LOAN_GIVEN",
    "LOAN_RECEIVED",
    "BANK_DEPOSIT",
    "BANK_WITHDRAWAL",
    "OTHER",
  ]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional().nullable(),
  personName: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  expectedReturnDate: z.string().optional().nullable(),
});

export type CreateCashTransactionInput = z.infer<typeof createCashTransactionSchema>;

export const updateOpeningBalanceSchema = z.object({
  openingBalance: z.number().min(0, "Opening balance cannot be negative"),
});

export type UpdateOpeningBalanceInput = z.infer<typeof updateOpeningBalanceSchema>;

