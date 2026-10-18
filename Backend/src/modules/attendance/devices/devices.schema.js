import { z } from "zod";
export const deviceSchema = z.object({
  name: z.string().min(2),
  ipAddress: z.string().min(3),
  port: z.coerce.number().int().min(1).max(65535).default(80),
  username: z.string().min(1),
  password: z.string().optional(),
});
export const adminPasswordSchema = z.object({
  password: z.string().optional(),
});
