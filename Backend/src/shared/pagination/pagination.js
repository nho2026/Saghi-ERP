import { z } from "zod";
export const parsePagination = (query) => ({
  page: z.coerce.number().int().min(1).default(1).parse(query.page),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .parse(query.pageSize),
});

export const paginationArgs = (query) => {
  const { page, pageSize } = parsePagination(query);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};

export const pageResult = (items, total, page, pageSize) => ({
  items,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  },
});
