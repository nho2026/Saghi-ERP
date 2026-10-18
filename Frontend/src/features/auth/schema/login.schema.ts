import { z } from "zod";

export const loginSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("credentials"),
    username: z.string().trim().min(1),
    password: z.string().min(1),
    remember: z.boolean(),
  }),
  z.object({
    method: z.literal("pin"),
    pin: z.string().regex(/^\d{6}$/),
  }),
]);
