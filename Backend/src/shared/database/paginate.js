import { prisma } from "./client.js";

export const mapPage = (result, present) =>
  Array.isArray(result)
    ? result.map(present)
    : { ...result, items: result.items.map(present) };

export function pageInput(query = {}) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  )
    throw Object.assign(
      new Error(
        "Invalid pagination. Page must be positive and pageSize between 1 and 100.",
      ),
      { status: 400 },
    );
  return { page, pageSize };
}

// Aggregate reports must calculate across all matching records before slicing.
export function paginateRows(items, query = {}) {
  const { page, pageSize } = pageInput(query);
  const total = items.length,
    totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  return {
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    pagination: { page: currentPage, pageSize, total, totalPages },
  };
}

// Unpaged callers remain supported for lookups and full report calculations.
// Table requests opt into bounded database reads with page/pageSize.
export async function paginate(
  model,
  query = {},
  args = {},
  searchFields = [],
) {
  if (query.page === undefined && query.pageSize === undefined)
    return prisma[model].findMany(args);
  const { page, pageSize } = pageInput(query);
  const search = String(query.search ?? "")
    .trim()
    .replace(/[\\%_]/g, "\\$&");
  const searchWhere =
    search && searchFields.length
      ? {
          OR: searchFields.map((path) =>
            path
              .split(".")
              .reduceRight((value, key) => ({ [key]: value }), {
                contains: search,
              }),
          ),
        }
      : {};
  const where = { AND: [args.where ?? {}, searchWhere] };
  const orderBy = [
    ...(Array.isArray(args.orderBy)
      ? args.orderBy
      : args.orderBy
        ? [args.orderBy]
        : []),
    { id: "asc" },
  ];
  return prisma.$transaction(async (tx) => {
    const total = await tx[model].count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const items = await tx[model].findMany({
      ...args,
      where,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return {
      items,
      pagination: { page: currentPage, pageSize, total, totalPages },
    };
  });
}
