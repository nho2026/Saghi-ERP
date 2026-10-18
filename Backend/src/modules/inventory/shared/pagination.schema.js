import { z } from "zod";
export const pageInput = (query) => ({
  page: z.coerce.number().int().min(1).default(1).parse(query.page),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .parse(query.pageSize),
});
