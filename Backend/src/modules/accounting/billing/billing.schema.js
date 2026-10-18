import { z } from "zod";
export const customerSchema = z.object({
  code: z.string().optional(),
  name: z.string().trim().min(2),
  phone: z.string().trim().nullable().optional(),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  address: z.string().trim().nullable().optional(),
  taxNumber: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
const itemSchema = z.object({
  description: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});
export const invoiceSchema = z.object({
  customerId: z.string(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable().optional(),
  currency: z.literal("USD").default("USD"),
  discountAmount: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "sent", "cancelled"]).default("draft"),
  notes: z.string().trim().nullable().optional(),
  items: z.array(itemSchema).min(1),
});
export const invoiceStatusSchema = z.object({
  status: z.enum(["draft", "sent", "cancelled"]),
});
export const paymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.coerce.number().positive(),
  method: z.enum(["cash", "card", "bank_transfer", "cheque", "other"]),
  reference: z.string().trim().nullable().optional(),
  paidAt: z.coerce.date().optional(),
  notes: z.string().trim().nullable().optional(),
});
