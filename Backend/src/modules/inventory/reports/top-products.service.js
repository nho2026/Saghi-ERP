import { prisma } from "../../../shared/database/client.js";
import { paginateRows } from "../../../shared/database/paginate.js";

export async function listTopProducts({ query = {} }, db = prisma) {
  const search = String(query.search ?? "").trim();
  const groups = await db.posSaleItem.groupBy({
    by: ["productId"],
    where: {
      sale: {
        status: "completed",
        ...(query.warehouseId && { warehouseId: String(query.warehouseId) }),
      },
      ...(search && {
        product: {
          OR: ["name", "sku"].map((field) => ({
            [field]: { contains: search },
          })),
        },
      }),
    },
    _sum: { quantity: true },
    orderBy: [{ _sum: { quantity: "desc" } }, { productId: "asc" }],
  });
  const page = paginateRows(groups, query);
  const products = await db.inventoryProduct.findMany({
    where: { id: { in: page.items.map((row) => row.productId) } },
    select: { id: true, name: true, sku: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));
  return {
    ...page,
    items: page.items.map((row) => ({
      ...byId.get(row.productId),
      id: row.productId,
      quantity: row._sum.quantity ?? 0,
    })),
  };
}
