import { z } from "zod";

export const ledgerParamsSchema = z.object({
  entityType: z.enum(["customer", "supplier"]),
  entityId: z.string().min(1, "Entity ID is required"),
});

export const customerLedgerParamsSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
});

export const supplierLedgerParamsSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
});

export const ledgerQuerySchema = z.object({
  entityType: z.enum(["customer", "supplier"]).optional(),
});

export type LedgerParams = z.infer<typeof ledgerParamsSchema>;
