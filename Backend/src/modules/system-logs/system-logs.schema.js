import { z } from "zod";

export const systemLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  module: z.string().trim().max(100).optional(),
  action: z.enum(["login", "create", "update", "delete"]).optional(),
  result: z.enum(["success", "failed"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
