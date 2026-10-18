import { z } from "zod";
import { Prisma } from "@prisma/client";
export const cashFlowSchema = z.object({
  flowDate: z.coerce.date(),
  flowType: z.enum(["inflow", "outflow"]),
  departmentId: z.string().trim().min(1).max(191),
  cashAccountId: z.string().trim().min(1).max(191).nullable().optional(),
  category: z.string().trim().min(2).max(191),
  amount: z.coerce
    .number()
    .positive()
    .max(999999999999.99)
    .refine(
      (value) => new Prisma.Decimal(value).decimalPlaces() <= 2,
      "Use at most two decimal places.",
    ),
  currency: z.enum(["USD"]).default("USD"),
  description: z.string().trim().min(2).max(191),
  status: z
    .enum(["planned", "pending", "confirmed", "cancelled"])
    .default("confirmed"),
});
const date = z.string().date().optional();
export const cashFlowQuerySchema = z
  .object({
    from: date,
    to: date,
    departmentId: z.string().trim().min(1).max(191).optional(),
    category: z.string().trim().min(1).max(191).optional(),
    currency: z.enum(["USD"]).optional(),
    status: z.enum(["planned", "pending", "confirmed", "cancelled"]).optional(),
    page: z.coerce.number().int().min(1).max(1000000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "The end date must be on or after the start date.",
  });
export function cashFlowWhere(q) {
  return {
    ...(q.status ? { status: q.status } : {}),
    ...(q.departmentId
      ? {
          departmentId: q.departmentId === "unassigned" ? null : q.departmentId,
        }
      : {}),
    ...(q.category ? { category: q.category } : {}),
    ...(q.currency ? { currency: q.currency } : {}),
    ...(q.from || q.to
      ? {
          flowDate: {
            ...(q.from ? { gte: new Date(`${q.from}T00:00:00.000Z`) } : {}),
            ...(q.to
              ? {
                  lt: new Date(
                    new Date(`${q.to}T00:00:00.000Z`).getTime() + 86400000,
                  ),
                }
              : {}),
          },
        }
      : {}),
  };
}
