import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";

export const reductionSchema = z.object({
  productId: z.string().trim().min(1),
  warehouseId: z.string().trim().min(1),
  quantity: z.number().finite().positive().max(1000000000),
  date: z.iso.date(),
  notes: z.string().trim().max(2000).default(""),
});
export const listReductions = ({ query }) => {
  const search = String(query.search ?? "").trim();
  return paginate(query, "inventoryMovement", {
    where: {
      movementType: "item_reduction",
      ...(query.warehouseId && { warehouseId: String(query.warehouseId) }),
      ...(search && {
        OR: [
          { product: { name: { contains: search } } },
          { product: { sku: { contains: search } } },
          { notes: { contains: search } },
        ],
      }),
    },
    include: { product: true, warehouse: true },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
  });
};
export async function createReduction({ body }, db = prisma) {
  const input = reductionSchema.parse(body);
  return db.$transaction(async (tx) => {
    const updated = await tx.inventoryStock.updateMany({
      where: {
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: { gte: input.quantity },
        product: { status: "active" },
      },
      data: { quantity: { decrement: input.quantity } },
    });
    if (updated.count !== 1) {
      throw Object.assign(
        new Error("Insufficient stock or product is unavailable."),
        { status: 409 },
      );
    }
    return tx.inventoryMovement.create({
      data: {
        productId: input.productId,
        warehouseId: input.warehouseId,
        movementType: "item_reduction",
        quantity: -input.quantity,
        occurredAt: new Date(`${input.date}T00:00:00.000Z`),
        notes: input.notes,
      },
      include: { product: true, warehouse: true },
    });
  });
}
