import { z } from "zod";

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
  lineItems: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string().optional(),
        category: z.string().optional(),
        quantity: z.number().int().positive("Quantity must be positive"),
        unitPrice: z.number().positive("Unit price must be positive"),
      }),
    )
    .min(1, "At least one line item is required")
    .refine(
      (items) =>
        items.every((it) => Boolean(it.productId) || Boolean(it.productName)),
      {
        message: "Each line item must have either productId or productName",
      },
    ),
  status: z.string().optional(),
  notes: z.string().optional(),
  gstRate: z.number().nonnegative().optional(),
});

export const updatePurchaseSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
});

export const purchaseIdSchema = z.object({
  id: z.string().min(1, "Purchase ID is required"),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
