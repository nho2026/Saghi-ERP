import { Prisma } from "@prisma/client";
import { prisma } from "../../../shared/database/client.js";
import { pageInput } from "../shared/pagination.schema.js";

export async function listStorage({ query = {} }) {
  const { page, pageSize } = pageInput(query);
  const search = String(query.search || "");
  const contains = search.replace(/[\\%_]/g, "\\$&");
  const categoryId = query.categoryId ? String(query.categoryId) : null;
  const warehouseId = query.warehouseId ? String(query.warehouseId) : null;
  const where = {
    status: "active",
    ...(warehouseId && { stocks: { some: { warehouseId } } }),
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: ["name", "sku", "barcode"].map((field) => ({
        [field]: { contains },
      })),
    }),
  };
  return prisma.$transaction(async (tx) => {
    const total = await tx.inventoryProduct.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const products = await tx.inventoryProduct.findMany({
      where,
      include: {
        category: true,
        stocks: {
          ...(warehouseId && { where: { warehouseId } }),
          select: { quantity: true },
        },
      },
      orderBy: [
        { name: query.sort === "desc" ? "desc" : "asc" },
        { id: "asc" },
      ],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    const [totals] = await tx.$queryRaw(Prisma.sql`
      SELECT COALESCE(SUM(q.quantity > 0), 0) AS products,
             COALESCE(SUM(GREATEST(q.quantity, 0)), 0) AS quantity,
             COALESCE(SUM(q.costPrice * GREATEST(q.quantity, 0)), 0) AS buy,
             COALESCE(SUM(q.sellingPrice * GREATEST(q.quantity, 0)), 0) AS sell
      FROM (
        SELECT p.id, p.costPrice, p.sellingPrice,
               COALESCE(SUM(s.quantity), 0) AS quantity
        FROM inventory_InventoryProduct p
        LEFT JOIN inventory_InventoryStock s ON s.productId = p.id
          ${warehouseId ? Prisma.sql`AND s.warehouseId = ${warehouseId}` : Prisma.empty}
        WHERE p.status = 'active'
          ${categoryId ? Prisma.sql`AND p.categoryId = ${categoryId}` : Prisma.empty}
          ${search ? Prisma.sql`AND (LOCATE(${search}, p.name) > 0 OR LOCATE(${search}, p.sku) > 0 OR LOCATE(${search}, p.barcode) > 0)` : Prisma.empty}
        GROUP BY p.id, p.costPrice, p.sellingPrice
      ) q
    `);
    return {
      items: products.map(({ stocks, ...product }) => ({
        ...product,
        quantity: stocks.reduce((sum, stock) => sum + stock.quantity, 0),
      })),
      pagination: { page: currentPage, pageSize, total, totalPages },
      totals: Object.fromEntries(
        Object.entries(totals).map(([key, value]) => [key, Number(value)]),
      ),
    };
  });
}
