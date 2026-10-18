import { z } from "zod";

const money = z.coerce
  .number()
  .finite()
  .min(0)
  .max(100000000)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
    "Use at most two decimal places.",
  );
export const testSchema = z.object({
  name: z.string().trim().min(1).max(191),
  specimen: z.string().trim().max(191).default(""),
  price: money,
  unit: z.string().trim().max(100).default(""),
  referenceRange: z.string().trim().max(191).default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});
export const orderSchema = z
  .object({
    requestId: z.string().uuid(),
    patientId: z.string().min(1).optional(),
    leadId: z.string().min(1).optional(),
    appointmentId: z.string().min(1).optional(),
    patient: z
      .object({
        firstName: z.string().trim().min(1).max(191),
        lastName: z.string().trim().min(1).max(191),
        phone: z.string().trim().min(1).max(50),
        address: z.string().trim().max(500).optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
      })
      .optional(),
    testIds: z
      .array(z.string().min(1))
      .min(1)
      .max(100)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "Select each test once.",
      ),
    notes: z.string().trim().max(5000).default(""),
  })
  .refine(
    (data) =>
      [data.patientId, data.leadId, data.patient].filter(Boolean).length === 1,
    "Select one patient source: existing patient, lead, or new patient.",
  );
export const stageSchema = z.object({
  status: z.enum([
    "collecting",
    "processing",
    "completed",
    "received",
    "called",
    "delivered",
  ]),
});
export const resultsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        result: z.string().trim().max(5000),
        resultNotes: z.string().trim().max(5000).default(""),
      }),
    )
    .min(1)
    .max(100),
});
export const paymentSchema = z.object({
  requestId: z.string().uuid(),
  method: z.enum(["cash", "card", "bank_transfer", "cheque", "other"]),
  amount: money.refine((n) => n > 0, "Payment must be greater than zero."),
});
