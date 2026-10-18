import { setStockQuantity } from "./set-quantity.js";
import { stockModel } from "./stock.model.js";
import { stockAdjustmentSchema } from "./stock.schema.js";
export const stockService = {
  summary: async ({ warehouseScope } = {}) =>
    (await stockModel.summary())
      .filter((row) => !warehouseScope || row.warehouseId === warehouseScope)
      .map((row) => ({
        warehouseId: row.warehouseId,
        total: Number(row.total),
        units: Number(row.units),
        empty: Number(row.emptyCount),
        low: Number(row.low),
      })),
  list: async ({ query = {} }) => {
    const where = {
      ...(query.onlyLow === "true" && stockModel.lowStockWhere()),
      ...(query.warehouseId && {
        warehouseId: String(query.warehouseId),
      }),
      ...(query.productId && { productId: String(query.productId) }),
    };
    return await stockModel.paginate(query, "inventoryStock", {
      where,
      include: { product: { include: { category: true } }, warehouse: true },
      orderBy: { product: { name: "asc" } },
    });
  },
  adjust: async ({ body }) => {
    if (body?.mode === "set") return setStockQuantity(stockModel, body);
    const input = stockAdjustmentSchema.parse(body);
    const incoming = [
      "purchase",
      "adjustment_in",
      "transfer_in",
      "return",
    ].includes(input.movementType);
    const signed = incoming ? input.quantity : -input.quantity;
    const result = await stockModel.$transaction(async (tx) => {
      const key = {
        productId: input.productId,
        warehouseId: input.warehouseId,
      };
      let stock;
      if (incoming) {
        stock = await tx.inventoryStock.upsert({
          where: { productId_warehouseId: key },
          update: {
            quantity: { increment: input.quantity },
            ...(input.reorderLevel !== undefined && {
              reorderLevel: input.reorderLevel,
            }),
          },
          create: {
            ...key,
            quantity: input.quantity,
            reorderLevel: input.reorderLevel ?? 0,
          },
          include: { product: true, warehouse: true },
        });
      } else {
        const deducted = await tx.inventoryStock.updateMany({
          where: { ...key, quantity: { gte: input.quantity } },
          data: {
            quantity: { decrement: input.quantity },
            ...(input.reorderLevel !== undefined && {
              reorderLevel: input.reorderLevel,
            }),
          },
        });
        if (deducted.count !== 1) {
          throw Object.assign(
            new Error("Insufficient stock for this movement."),
            { status: 409 },
          );
        }
        stock = await tx.inventoryStock.findUnique({
          where: { productId_warehouseId: key },
          include: { product: true, warehouse: true },
        });
      }
      await tx.inventoryMovement.create({
        data: {
          productId: input.productId,
          warehouseId: input.warehouseId,
          movementType: input.movementType,
          quantity: signed,
          reference: input.reference,
          notes: input.notes,
        },
      });
      return stock;
    });
    return result;
  },
};
