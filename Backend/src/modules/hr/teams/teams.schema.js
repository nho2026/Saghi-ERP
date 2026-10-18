import { z } from "zod";
export const teamSchema = z.object({
  leaderId: z.string().trim().min(1).nullable().optional(),
  name: z.string().trim().min(2),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
