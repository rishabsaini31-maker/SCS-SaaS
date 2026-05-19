import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().default("/api/v1"),
});

const parsed = schema.parse(process.env);

export const frontendConfig = {
  apiUrl: parsed.NEXT_PUBLIC_API_URL,
};
