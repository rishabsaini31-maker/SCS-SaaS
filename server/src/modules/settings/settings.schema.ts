import { z } from "zod";

export const updateTenantSettingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  ownerName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  invoicePrefix: z.string().min(1).optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  defaultGst: z.number().nonnegative().optional(),
  taxCalculation: z.boolean().optional(),
});
