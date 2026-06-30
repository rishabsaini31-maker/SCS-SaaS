import { z } from "zod";

export const createShopSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gst: z.string().optional(),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const tenantStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const resetOwnerPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const tenantIdParamSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
});

export const updateShopSchema = z.object({
  businessName: z.string().min(1, "Business name is required").optional(),
  ownerName: z.string().min(1, "Owner name is required").optional(),
  phone: z.string().optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type TenantStatusInput = z.infer<typeof tenantStatusSchema>;
export type ResetOwnerPasswordInput = z.infer<typeof resetOwnerPasswordSchema>;
export type TenantIdParamInput = z.infer<typeof tenantIdParamSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
