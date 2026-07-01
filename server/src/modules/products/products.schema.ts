import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().optional(),
  purchasePrice: z.number().positive("Purchase price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  gst: z.number().min(0).max(100).default(18),
  stock: z.number().int().nonnegative().default(0),
  image: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  customFields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export const updateProductSchema = createProductSchema.partial();
export const productIdSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
