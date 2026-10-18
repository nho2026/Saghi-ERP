import { z } from "zod";
const text = z.string().trim().min(1).max(191);
const money = z.number().finite().min(0).max(999999999);
export const productSchema = z.object({
  name: text,
  category: text,
  barcode: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .transform((v) => v || null),
  price: money,
  active: z.boolean().default(true),
});
export const expenseSchema = z.object({
  departmentId: text,
  category: z.enum(["daily", "cleaning", "drinks", "maintenance", "other"]),
  description: text,
  amount: money.positive(),
  date: z.iso.date(),
  paidBy: text,
  note: z.string().trim().max(5000).default(""),
});
export const requestSchema = z.object({
  departmentId: text,
  kind: z.enum(["purchase", "sale"]),
  invoiceNumber: z.string().trim().max(100).nullable().optional(),
  attachmentUrl: z
    .string()
    .regex(/^\/public\/product-images\/[a-f0-9-]{36}\.(png|jpg|jpeg|webp|gif)$/)
    .nullable()
    .optional(),
  paidAmount: money.default(0),
  paymentMethod: z.enum(["cash", "card", "bank"]).default("cash"),
  note: z.string().trim().max(5000).default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).nullable(),
        name: text,
        quantity: z.number().int().positive().max(1000000),
        price: money,
        note: z.string().trim().max(1000).default(""),
      }),
    )
    .min(1)
    .max(100),
});
export const allocationSchema = z.object({
  quantity: z.number().int().min(0).max(1000000),
  previousQuantity: z.number().int().min(0),
});
export const paymentSchema = z.object({
  amount: z.number().finite().positive().max(999999999),
  paymentMethod: z.enum(["cash", "card", "bank"]),
});
export const requestStatusSchema = z.object({
  status: z.string(),
  reason: z.string().trim().max(5000).default(""),
});
export const transitions = {
  draft: ["pending", "cancelled"],
  pending: ["approved", "rejected", "cancelled"],
  approved: ["ordered", "completed", "cancelled"],
  ordered: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
};
export function validateTransition(current, next, kind, reason = "") {
  if (
    !transitions[current]?.includes(next) ||
    (kind === "sale" && next === "ordered") ||
    (kind === "purchase" && current === "approved" && next === "completed")
  )
    throw Object.assign(new Error("Invalid request status transition."), {
      status: 409,
    });
  if (["rejected", "cancelled"].includes(next) && !reason.trim())
    throw Object.assign(new Error("A reason is required."), { status: 400 });
}
