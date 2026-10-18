import { z } from "zod";

export const employeeIdeaSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(5).max(10000),
});
