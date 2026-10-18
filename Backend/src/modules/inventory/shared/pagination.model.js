import { prisma } from "../../../shared/database/client.js";
import { pageInput } from "./pagination.schema.js";
export async function paginate(query, model, args) {
  if (query.all === "true") return prisma[model].findMany(args);
  const { page, pageSize } = pageInput(query);
  const orderBy = [
    ...(Array.isArray(args.orderBy)
      ? args.orderBy
      : args.orderBy
        ? [args.orderBy]
        : []),
    { id: "asc" },
  ];
  const [initialItems, total] = await prisma.$transaction([
    prisma[model].findMany({
      ...args,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma[model].count({ where: args.where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const items =
    currentPage === page
      ? initialItems
      : await prisma[model].findMany({
          ...args,
          orderBy,
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
        });
  return {
    items,
    pagination: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
    },
  };
}
