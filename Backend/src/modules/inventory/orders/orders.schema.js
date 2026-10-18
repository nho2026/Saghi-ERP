import { z } from "zod";
export const ordersSchema = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(1).max(150),
  note: z.string().trim().max(5000).default(""),
  items: z
    .array(
      z
        .object({
          originalIndex: z.number().int().min(0).optional(),
          imageUrl: z
            .string()
            .regex(/^\/public\/product-images\/[a-zA-Z0-9.-]+$/)
            .nullable()
            .default(null),
          isNew: z.boolean().default(false),
          productId: z.string().nullable().default(null),
          name: z.string().trim().max(200).default(""),
          size: z.string().trim().max(100).default(""),
          code: z.string().trim().max(100).default(""),
          quantity: z.number().finite().positive().max(1000000),
          price: z
            .number()
            .finite()
            .min(0)
            .max(100000000)
            .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.000001),
          note: z.string().trim().max(1000).default(""),
        })
        .refine(
          (item) => (item.isNew ? !!item.name : !!item.productId),
          "Select a product or enter a new product name.",
        ),
    )
    .min(1)
    .max(100),
});

export const arrivalSchema = z.object({
  index: z.number().int().min(0),
  arrived: z.boolean(),
});
