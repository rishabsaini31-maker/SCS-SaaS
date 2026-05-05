import { z } from "zod";

export const ledgerParamsSchema = z.object({
  entityType: z.enum(["customer", "supplier"]),
  entityId: z.string().min(1, "Entity ID is required"),
});

export type LedgerParams = z.infer<typeof ledgerParamsSchema>;
