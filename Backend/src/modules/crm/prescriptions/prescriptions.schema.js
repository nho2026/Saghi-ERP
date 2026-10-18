import { z } from "zod";
export const prescriptionSchema = z.object({
  requestId: z.uuid(),
  notes: z.string().trim().max(4000).default(""),
  items: z
    .array(
      z.object({
        medicine: z.string().trim().min(1).max(200),
        dosage: z.string().trim().min(1).max(200),
        frequency: z.string().trim().min(1).max(200),
        productId: z.string().trim().min(1).optional(),
        unitPrice: z.number().finite().min(0).max(100000000).optional(),
        quantity: z.number().int().positive().max(100000),
        instructions: z.string().trim().max(1000).default(""),
      }),
    )
    .min(1)
    .max(50),
});
