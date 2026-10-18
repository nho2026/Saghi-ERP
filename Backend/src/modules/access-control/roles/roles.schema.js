import { z } from "zod";
export const permissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});
export const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});
