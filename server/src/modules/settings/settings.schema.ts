import { z } from "zod";

export const updateTenantSettingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  gstNumber: z.string().optional(),
  invoicePrefix: z.string().min(1).optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
});
