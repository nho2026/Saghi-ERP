import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { pageInput } from "../shared/pagination.schema.js";

export async function listExpiry({ query = {}, warehouseScope }) {
  const { page, pageSize } = pageInput(query);
  const status = z
    .enum(["all", "expired", "soon", "valid", "unknown"])
    .default("soon")
    .parse(query.status);
  const maximum =
    query.maximum === undefined || query.maximum === ""
      ? null
      : z.coerce.number().int().min(0).max(365000).parse(query.maximum);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${today}T00:00:00Z`);
  const afterDays = (days) => new Date(start.getTime() + days * 86400000);
  const dates = {
    expired: { lt: start },
    soon: { gte: start, lte: afterDays(30) },
    valid: { gt: afterDays(30) },
  };
  const search = String(query.search || "")
    .trim()
    .replace(/[\\%_]/g, "\\$&");
  const warehouseId = query.warehouseId ? String(query.warehouseId) : null;
  const where = {
    status: "active",
    ...(query.categoryId && { categoryId: String(query.categoryId) }),
    ...(warehouseId && { stocks: { some: { warehouseId } } }),
    ...(search && {
      OR: ["name", "sku", "barcode"].map((field) => ({
        [field]: { contains: search },
      })),
    }),
    AND: [
      ...(status === "unknown"
        ? [{ expiryDate: null }]
        : status === "all"
          ? []
          : [{ expiryDate: dates[status] }]),
      ...(maximum === null
        ? []
        : [{ expiryDate: { lte: afterDays(maximum) } }]),
    ],
  };
  return prisma.$transaction(async (tx) => {
    const total = await tx.inventoryProduct.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const items = await tx.inventoryProduct.findMany({
      where,
      include: {
        category: true,
        stocks: { ...(warehouseId && { where: { warehouseId } }) },
      },
      orderBy: [
        { expiryDate: { sort: "asc", nulls: "last" } },
        { name: "asc" },
        { id: "asc" },
      ],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    const warehouses = await tx.inventoryWarehouse.findMany({
      ...(warehouseScope && { where: { id: warehouseScope } }),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    const categories = await tx.productCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return {
      items,
      pagination: { page: currentPage, pageSize, total, totalPages },
      warehouses,
      categories,
      today,
    };
  });
}
