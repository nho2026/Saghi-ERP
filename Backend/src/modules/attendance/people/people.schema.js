import { z } from "zod";
export const personSchema = z.object({
  deviceId: z.string(),
  employeeId: z.string().nullable().optional(),
  employeeNo: z
    .string()
    .regex(/^\d{1,32}$/, "Employee number must contain only digits."),
  name: z.string().min(2),
  cardNo: z.string().regex(/^\d+$/).optional(),
});
export const updatePersonSchema = z.object({
  employeeId: z.string().nullable().optional(),
  name: z.string().min(2).optional(),
  cardNo: z.string().regex(/^\d+$/).nullable().optional(),
});
export const syncPeopleSchema = z.object({ deviceId: z.string().optional() });
export const methodSchema = z.enum(["card", "fingerprint", "face", "pin"]);
export const credentialSchema = z.object({
  cardNo: z.string().regex(/^\d+$/).optional(),
  pin: z
    .string()
    .regex(/^\d{4,8}$/)
    .optional(),
});
export const deletePersonSchema = z.object({ password: z.string().optional() });
