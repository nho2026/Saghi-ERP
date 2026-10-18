import { z } from "zod";
const schema = z.object({
  mode: z.literal("set"),
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().finite().min(0).max(1000000000),
  expectedQuantity: z.number().finite(),
  notes: z.string().trim().max(5000).default(""),
});
export async function setStockQuantity(db, body) {
  const input = schema.parse(body);
  return db.$transaction(async (tx) => {
    const key = { productId: input.productId, warehouseId: input.warehouseId };
    const stock = await tx.inventoryStock.upsert({
      where: { productId_warehouseId: key },
      create: { ...key, quantity: 0 },
      update: {},
    });
    if (stock.quantity !== input.expectedQuantity)
      throw Object.assign(
        new Error(
          "Stock changed. Close and reopen quantity editing to load the latest balance.",
        ),
        { status: 409 },
      );
    const delta = input.quantity - stock.quantity;
    if (!delta) return stock;
    const updated = await tx.inventoryStock.updateMany({
      where: { ...key, quantity: input.expectedQuantity },
      data: { quantity: input.quantity },
    });
    if (updated.count !== 1)
      throw Object.assign(
        new Error(
          "Stock changed. Close and reopen quantity editing to load the latest balance.",
        ),
        { status: 409 },
      );
    await tx.inventoryMovement.create({
      data: {
        ...key,
        movementType: delta > 0 ? "adjustment_in" : "adjustment_out",
        quantity: delta,
        notes: `Product quantity corrected from ${stock.quantity} to ${input.quantity}${input.notes ? `: ${input.notes}` : ""}`,
      },
    });
    return { ...stock, quantity: input.quantity };
  });
}
