import { z } from "zod";
const optionalDate = z.union([z.coerce.date(), z.null()]).optional();
export const payrollSchema = z.object({
  employeeId: z.string(),
  salaryId: z.string(),
  year: z.coerce.number().int().min(2000).max(2200),
  month: z.coerce.number().int().min(1).max(12),
  baseSalary: z.coerce.number().nonnegative(),
  overtimeAmount: z.coerce.number().nonnegative().default(0),
  bonusAmount: z.coerce.number().nonnegative().default(0),
  allowanceAmount: z.coerce.number().nonnegative().default(0),
  lateDeduction: z.coerce.number().nonnegative().default(0),
  absenceDeduction: z.coerce.number().nonnegative().default(0),
  otherDeduction: z.coerce.number().nonnegative().default(0),
  status: z.enum(["draft", "approved", "paid"]).default("draft"),
  paidAt: optionalDate,
});
