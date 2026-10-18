import { z } from "zod";
export const transfersSchema = z
  .object({
    toWarehouseId: z.string().min(1),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          fromWarehouseId: z.string().min(1),
          quantity: z.number().finite().positive().max(1000000),
        }),
      )
      .min(1)
      .max(100),
  })
  .refine(
    (input) =>
      input.items.every((item) => item.fromWarehouseId !== input.toWarehouseId),
    "Source and destination storage must differ.",
  );
