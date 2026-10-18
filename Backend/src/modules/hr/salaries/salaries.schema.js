import { z } from "zod";
export const salarySchema = z.object({
  employeeId: z.string(),
  baseSalary: z.coerce.number().nonnegative(),
  currencyId: z.enum(["IQD", "USD"]).default("IQD"),
  payType: z.string().trim().min(1),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.union([z.coerce.date(), z.null()]).optional(),
});
