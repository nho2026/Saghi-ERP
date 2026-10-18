import { z } from "zod";

const nullable = z.string().trim().nullable().optional();

export const referralSchema = z.object({
  patientId: z.string().min(1),
  referrerName: z.string().trim().min(2),
  referrerPhone: nullable,
  referrerProfession: nullable,
  referrerAddress: nullable,
  direction: z.enum(["inbound", "outbound"]).default("inbound"),
  referralPersona: z
    .enum(["doctor", "our_patient", "people"])
    .nullable()
    .optional(),
  referringPatientName: nullable,
  referralType: z
    .enum(["patient", "doctor", "employee", "organization", "other"])
    .default("patient"),
  referredAt: z.coerce.date(),
  notes: nullable,
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
});

export const referralFilterSchema = z.object({
  search: z.string().trim().max(191).optional(),
  patientId: z.string().optional(),
  referralType: z
    .enum(["patient", "doctor", "employee", "organization", "other"])
    .optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
