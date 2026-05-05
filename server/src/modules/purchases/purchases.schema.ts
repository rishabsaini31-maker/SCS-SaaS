import { z } from "zod";

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
  lineItems: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    unitPrice: z.number().positive("Unit price must be positive"),
  })).min(1, "At least one line item is required"),
  notes: z.string().optional(),
});

export const purchaseIdSchema = z.object({
  id: z.string().min(1, "Purchase ID is required"),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
