import { z } from "zod";
import { posFilterShape, validateSaleRanges } from "./pos-filters.js";

export const posSalesQuerySchema = z
  .object({
    ...posFilterShape,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  })
  .superRefine(validateSaleRanges);
export const createSaleSchema = z.object({
  warehouseId: z.string(),
  customerName: z.string().trim().nullable().optional(),
  paymentMethod: z.enum(["cash", "card", "bank_transfer"]),
  discountAmount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0),
  notes: z.string().trim().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().positive(),
      }),
    )
    .min(1),
});
export const returnSaleSchema = z.object({
  saleNumber: z.string().trim().min(1),
});
export const cancelSaleSchema = z.object({
  password: z.string().min(1).max(128),
});
