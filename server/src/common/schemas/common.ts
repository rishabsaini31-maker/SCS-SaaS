import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const optionalStringQuery = z.string().optional();

export const dateRangeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  date: z.string().optional(),
  month: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  barcode: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  threshold: z.coerce.number().int().optional(),
  q: z.string().optional(),
  query: z.string().optional(),
});
