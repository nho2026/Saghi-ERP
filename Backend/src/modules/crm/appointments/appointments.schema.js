import { z } from "zod";

const nullableText = z.string().trim().nullable().optional();

export const appointmentSchema = z.object({
  patientName: z.string().trim().min(2),
  patientPhone: z.string().trim().min(5),
  patientEmail: z
    .union([z.string().email(), z.literal(""), z.null()])
    .optional(),
  doctorId: z.string(),
  departmentId: z.string(),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(10).max(480).optional(),
  reason: nullableText,
  notes: nullableText,
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled", "no_show"])
    .default("pending"),
});

export const bookingSchema = appointmentSchema
  .pick({
    patientName: true,
    patientPhone: true,
    patientEmail: true,
    doctorId: true,
    departmentId: true,
    scheduledAt: true,
    reason: true,
  })
  .extend({
    scheduledAt: z.coerce
      .date()
      .refine(
        (value) => value > new Date(),
        "Appointment must be in the future.",
      ),
  });

export const appointmentCreateSchema = appointmentSchema.extend({
  patientId: z.string().min(1).optional(),
});
