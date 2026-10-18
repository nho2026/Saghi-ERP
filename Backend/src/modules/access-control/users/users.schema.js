import { z } from "zod";
export const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  pin: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
  department: z.string().optional(),
  warehouseId: z.string().min(1).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  roleIds: z.array(z.string()).default([]),
});
export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    roleIds: z.array(z.string()).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    password: z.string().min(8).optional(),
    pin: z.union([z.string().regex(/^\d{6}$/), z.null()]).optional(),
  });
export const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});
