import { z } from "zod";

export const myAttendanceQuerySchema = z.object({
  month: z.string().regex(/^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/),
});

export const employeeIdeaSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(5).max(10000),
});
