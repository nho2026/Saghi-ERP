import { z } from "zod";

const date = z.coerce.date();
const optionalDate = z.union([date, z.null()]).optional();

export const salaryAdvanceSchema = z.object({
  employeeId: z.string(),
  amount: z.coerce.number().positive(),
  currency: z.enum(["USD", "IQD"]).default("USD"),
  requestedAt: date,
  approvedAt: optionalDate,
  deductionStartDate: optionalDate,
  installments: z.coerce.number().int().min(1).max(120).default(1),
  deductedAmount: z.coerce.number().min(0).default(0),
  status: z
    .enum([
      "requested",
      "approved",
      "active",
      "completed",
      "rejected",
      "cancelled",
    ])
    .default("requested"),
  notes: z.string().trim().nullable().optional(),
});

export const serviceAdvanceSchema = z.object({
  patientName: z.string().trim().min(2),
  patientPhone: z.string().trim().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  appointmentId: z.string().nullable().optional(),
  amount: z.coerce.number().positive(),
  appliedAmount: z.coerce.number().min(0).default(0),
  currency: z.literal("USD").default("USD"),
  method: z.enum(["cash", "card", "bank_transfer", "cheque", "other"]),
  reference: z.string().trim().nullable().optional(),
  receivedAt: date,
  status: z
    .enum(["open", "partially_applied", "applied", "refunded", "cancelled"])
    .default("open"),
  notes: z.string().trim().nullable().optional(),
});
