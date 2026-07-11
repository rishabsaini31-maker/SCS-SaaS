import { z } from "zod";
import { StaffRole } from "@prisma/client";

export const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(StaffRole).default(StaffRole.SALESMAN),
  canOverridePrice: z.boolean().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.nativeEnum(StaffRole).optional(),
  canOverridePrice: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const toggleStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;
