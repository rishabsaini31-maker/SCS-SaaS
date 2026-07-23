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

export const elementPositionSchema = z.object({
  xMm: z.number(),
  yMm: z.number(),
  widthMm: z.number(),
  heightMm: z.number().optional(),
  align: z.enum(["left", "center", "right"]).default("left"),
  fontBold: z.boolean().default(true),
  fontSizePt: z.number().positive(),
  maxLines: z.number().int().positive().optional(),
  truncate: z.boolean().default(true),
});

export const barcodeElementSchema = z.object({
  xMm: z.number(),
  yMm: z.number(),
  widthMm: z.number(),
  heightMm: z.number(),
  quietZoneMm: z.number().default(3),
  type: z.literal("CODE128").default("CODE128"),
});

export const labelTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
  widthMm: z.number().positive().default(50),
  heightMm: z.number().positive().default(25),
  paddingMm: z.number().nonnegative().default(2),
  dpi: z.union([z.literal(203), z.literal(300)]).default(203),
  shopName: elementPositionSchema,
  productName: elementPositionSchema,
  barcode: barcodeElementSchema,
  barcodeNumber: elementPositionSchema,
  text1: elementPositionSchema,
  text2: elementPositionSchema,
});

export const printerSettingsSchema = z.object({
  printerName: z.string().default("Generic TSPL Thermal Printer"),
  labelSize: z.enum(["50x25", "38x25", "100x50", "custom"]).default("50x25"),
  customWidthMm: z.number().positive().optional(),
  customHeightMm: z.number().positive().optional(),
  dpi: z.union([z.literal(203), z.literal(300)]).default(203),
  darkness: z.number().int().min(1).max(15).default(10),
  printSpeed: z.number().int().min(2).max(6).default(4),
  gapMm: z.number().nonnegative().default(2),
  orientation: z.enum(["PORTRAIT", "LANDSCAPE"]).default("PORTRAIT"),
  defaultCopies: z.number().int().positive().default(1),
});

export const updatePrintingConfigSchema = z.object({
  printerSettings: printerSettingsSchema.partial().optional(),
  activeTemplate: labelTemplateSchema.partial().optional(),
  customTemplates: z.array(labelTemplateSchema).optional(),
});

export const printTsplSchema = z.object({
  productId: z.string().min(1),
  copies: z.number().int().positive().default(1),
  shopName: z.string().optional(),
  customText1: z.string().optional(),
  customText2: z.string().optional(),
});
