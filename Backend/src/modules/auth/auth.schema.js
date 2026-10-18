import { z } from "zod";
export const loginSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("credentials"),
    username: z.string().min(1),
    password: z.string().min(6),
    remember: z.boolean().default(false),
  }),
  z.object({
    method: z.literal("pin"),
    pin: z.string().regex(/^\d{6}$/),
  }),
]);
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  department: z.string().trim().max(120).nullable().optional(),
});
