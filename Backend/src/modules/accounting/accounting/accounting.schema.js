import { z } from "zod";
export const accountSchema = z.object({
  code: z.string().trim().min(1).max(30),
  name: z.string().trim().min(2),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parentId: z.string().nullable().optional(),
  currency: z.literal("USD").default("USD"),
  status: z.enum(["active", "inactive"]).default("active"),
});
const lineSchema = z
  .object({
    accountId: z.string(),
    description: z.string().trim().nullable().optional(),
    debit: z.coerce.number().min(0).default(0),
    credit: z.coerce.number().min(0).default(0),
  })
  .refine((line) => line.debit > 0 !== line.credit > 0, {
    message: "Each line must contain either a debit or a credit.",
  });
export const journalSchema = z.object({
  entryDate: z.coerce.date(),
  description: z.string().trim().min(2),
  reference: z.string().trim().nullable().optional(),
  lines: z.array(lineSchema).min(2),
});
