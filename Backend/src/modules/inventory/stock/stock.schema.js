import { z } from "zod";
export const stockAdjustmentSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  movementType: z.enum([
    "purchase",
    "adjustment_in",
    "adjustment_out",
    "transfer_in",
    "transfer_out",
    "return",
  ]),
  quantity: z.coerce.number().positive(),
  reorderLevel: z.coerce.number().min(0).optional(),
  reference: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});
