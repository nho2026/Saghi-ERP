import { prisma } from "../../../shared/database/client.js";
import { pageInput } from "../shared/pagination.schema.js";

export async function listThresholds({ query = {}, warehouseScope }) {
  const { page, pageSize } = pageInput(query);
  const search = String(query.search || "")
    .trim()
    .replace(/[\\%_]/g, "\\$&");
  const where = {
    ...(query.warehouseId && { warehouseId: String(query.warehouseId) }),
    product: {
      ...(query.categoryId && { categoryId: String(query.categoryId) }),
      ...(search && {
        OR: ["name", "sku", "size"].map((field) => ({
          [field]: { contains: search },
        })),
      }),
    },
    ...(query.onlyLow === "true" && {
      quantity: { lte: prisma.inventoryStock.fields.reorderLevel },
    }),
  };
  return prisma.$transaction(async (tx) => {
    const total = await tx.inventoryStock.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const items = await tx.inventoryStock.findMany({
      where,
      include: { product: { include: { category: true } }, warehouse: true },
      orderBy: [{ product: { name: "asc" } }, { id: "asc" }],
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
      filters: { warehouses, categories },
    };
  });
}
