import { z } from "zod";

export const generateBarcodeSchema = z.object({
  productId: z.string().min(1, "productId is required"),
});

export const getBarcodeParamsSchema = z.object({
  productId: z.string().min(1, "productId is required"),
});

export const printDataSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().positive(),
  labelSize: z.enum(["small", "medium", "large"]),
  showName: z.boolean().optional().default(true),
  showPrice: z.boolean().optional().default(true),
});

export type PrintDataInput = z.infer<typeof printDataSchema>;
