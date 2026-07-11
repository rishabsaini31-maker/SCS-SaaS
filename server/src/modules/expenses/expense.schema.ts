import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  category: z.string().min(1, "Category is required"),
  customCategory: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  paymentMode: z.string().min(1, "Payment Mode is required"),
  paymentAccount: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
