import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
export const customerIdSchema = z.object({
  id: z.string().min(1, "Customer ID is required"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
