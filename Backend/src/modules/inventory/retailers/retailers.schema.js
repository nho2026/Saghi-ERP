import { z } from "zod";
export const retailerSchema = z.object({
  name: z.string().trim().min(1).max(191),
  phone: z.string().trim().max(50).default(""),
  email: z.union([z.email().max(191), z.literal("")]).default(""),
  note: z.string().trim().max(5000).default(""),
});
