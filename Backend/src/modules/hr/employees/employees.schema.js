import { z } from "zod";
export const employeeSchema = z.object({
  employeeCode: z.string().optional(),
  userId: z.string().trim().nullable().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  departmentId: z.string().trim().min(1, "Department is required"),
  positionId: z.string().trim().nullable().optional(),
  hireDate: z.coerce.date(),
  scheduleType: z.enum(["static", "dynamic"]).optional(),
  workSchedule: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        checkInTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .optional(),
        checkOutTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .optional(),
        hours: z.number().positive().max(24).optional(),
      }),
    )
    .min(1)
    .max(7)
    .refine(
      (days) => new Set(days.map((day) => day.day)).size === days.length,
      "Working days must be unique",
    )
    .refine(
      (days) =>
        days.every(
          (day) =>
            day.hours != null ||
            (day.checkInTime &&
              day.checkOutTime &&
              day.checkInTime !== day.checkOutTime),
        ),
      "Check-in and check-out must be different",
    )
    .optional(),
  checkInTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  checkOutTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  status: z.enum(["active", "inactive", "terminated"]).default("active"),
});
