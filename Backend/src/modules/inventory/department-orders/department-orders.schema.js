import { z } from "zod";
export const departmentOrderStatus = z.enum([
  "pending",
  "approved",
  "completed",
  "rejected",
  "cancelled",
  "returned",
]);
export const departmentOrderSchema = z.object({
  departmentId: z.string().min(1),
  type: z.enum(["equipment", "disposable"]),
  deadline: z.iso.date().nullable().default(null),
  note: z.string().trim().max(5000).default(""),
  phone: z
    .string()
    .regex(/^[+\d ()-]{3,30}$/)
    .nullable()
    .default(null),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        warehouseId: z.string().min(1),
        name: z.string().trim().max(200).default(""),
        quantity: z.number().positive().max(1000000),
      }),
    )
    .min(1)
    .max(100),
});
export const departmentOrderUpdate = z
  .object({
    status: departmentOrderStatus,
    reason: z.string().trim().max(5000).default(""),
    price: z.number().finite().min(0).max(100000000).nullable().optional(),
  })
  .refine(
    (input) => input.status !== "rejected" || !!input.reason,
    "A rejection reason is required.",
  );
export const departmentOrderComment = z.object({
  note: z.string().trim().min(1).max(5000),
});
