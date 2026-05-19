import { z } from "zod";

export const scsAdminLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type ScsAdminLoginInput = z.infer<typeof scsAdminLoginSchema>;
