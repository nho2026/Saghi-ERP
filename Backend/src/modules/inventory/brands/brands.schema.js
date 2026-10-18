import { z } from "zod";
export const brandSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
