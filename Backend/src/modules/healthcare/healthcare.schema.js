import { z } from "zod";
const nullable = z.string().trim().nullable().optional();
export const departmentSchema = z.object({
  type: z.enum(["hospital", "office"]).optional(),
  code: z
    .string()
    .regex(/^DEP-[1-9][0-9]*$/)
    .max(20)
    .optional(),
  name: z.string().trim().min(2),
  description: nullable,
  managerId: z.string().trim().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
});
export const departmentIdsSchema = z.object({
  ids: z
    .array(z.string().trim().min(1).max(191))
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, "IDs must be unique."),
});
export const staffSchema = z.object({
  positionId: z.string().min(1).nullable().optional(),
  employeeId: z.string(),
  departmentId: z.string().nullable().optional(),
  staffType: z.enum([
    "doctor",
    "nurse",
    "technician",
    "pharmacist",
    "therapist",
    "other",
  ]),
  specialization: nullable,
  licenseNumber: nullable,
  biography: nullable,
  publicBookingEnabled: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
});
