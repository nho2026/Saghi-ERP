import { z } from "zod";
export const attendanceSchema = z.object({
  employeeId: z.string(),
  attendanceDate: z.coerce.date(),
  checkIn: z.union([z.coerce.date(), z.null()]).optional(),
  checkOut: z.union([z.coerce.date(), z.null()]).optional(),
  workedMinutes: z.coerce.number().int().nonnegative().default(0),
  lateMinutes: z.coerce.number().int().nonnegative().default(0),
  earlyLeaveMinutes: z.coerce.number().int().nonnegative().default(0),
  overtimeMinutes: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["present", "absent", "leave", "holiday"]).default("present"),
});
