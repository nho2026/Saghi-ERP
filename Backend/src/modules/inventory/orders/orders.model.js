import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const ordersModel = {
  findRequest: (requestId) =>
    prisma.inventoryOrder.findUnique({ where: { requestId } }),
  products: (ids) =>
    prisma.inventoryProduct.findMany({
      where: { id: { in: ids }, status: "active" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
  update: (id, previous, data) =>
    prisma.inventoryOrder.updateMany({
      where: {
        id,
        name: previous.name,
        note: previous.note,
        items: { equals: previous.items },
      },
      data,
    }),
  create: (data) => prisma.inventoryOrder.create({ data }),
  find: (id) => prisma.inventoryOrder.findUnique({ where: { id } }),
  updateArrival: (id, previousItems, items) =>
    prisma.inventoryOrder.updateMany({
      where: { id, items: { equals: previousItems } },
      data: { items },
    }),
  remove: (id) => prisma.inventoryOrder.delete({ where: { id } }),
  list: (query) =>
    paginate(query, "inventoryOrder", {
      where: query.search
        ? {
            OR: ["id", "name", "note"].map((key) => ({
              [key]: { contains: String(query.search).trim() },
            })),
          }
        : {},
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
};
