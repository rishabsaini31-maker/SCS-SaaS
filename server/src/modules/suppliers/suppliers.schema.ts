import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();
export const supplierIdSchema = z.object({
  id: z.string().min(1, "Supplier ID is required"),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
