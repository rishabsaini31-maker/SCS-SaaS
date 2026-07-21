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
  labelSize: z.enum(["small", "medium", "large", "50x25"]).optional(),
  labelWidthMm: z.number().positive().optional(),
  labelHeightMm: z.number().positive().optional(),
  showName: z.boolean().optional().default(true),
  showPrice: z.boolean().optional().default(true),
  shopName: z.string().optional(),
  customText1: z.string().optional(),
  customText2: z.string().optional(),
});

export type PrintDataInput = z.infer<typeof printDataSchema>;
