import { z } from "zod";

export const operationTypeSchema = z.object({
  name: z.string().trim().min(1).max(191),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const itemReductionSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().finite().positive().max(1000000000),
  date: z.iso.date(),
  notes: z.string().trim().max(2000).default(""),
});
