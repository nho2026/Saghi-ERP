import { z } from "zod";

export const payrollAdjustmentSchema = z.object({
  employeeId: z.string(),
  type: z.enum(["reward", "punishment"]),
  amount: z.coerce.number().positive(),
  reason: z.string().trim().min(2).max(2000),
});
