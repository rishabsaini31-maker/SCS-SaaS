import { z } from "zod";

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  lineItems: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
  })).min(1, "At least one line item is required"),
  notes: z.string().optional(),
});

export const invoiceIdSchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
