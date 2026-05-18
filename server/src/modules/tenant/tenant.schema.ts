import { z } from "zod";

export const createTenantSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
});

export const tenantIdSchema = z.object({
  id: z.string().min(1, "Tenant ID is required"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
