import { z } from "zod";

export const invoiceSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      }),
    )
    .min(1),
  date: z.string().optional(),
  notes: z.string().optional(),
});
