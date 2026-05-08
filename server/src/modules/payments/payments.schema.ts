import { z } from "zod";

export const createPaymentSchema = z.object({
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  invoiceId: z.string().optional(),
  purchaseId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentIdSchema = z.object({
  id: z.string().min(1, "Payment ID is required"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
