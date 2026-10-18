import { z } from "zod";
export const feedbackSchema = z.object({
  targetType: z.enum(["product", "service"]),
  targetId: z.string(),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z
    .union([z.string().trim().email(), z.literal(""), z.null()])
    .optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(5000),
});
export const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});
export const serviceSchema = z.object({
  code: z.string().optional(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  price: z.coerce.number().min(0).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
