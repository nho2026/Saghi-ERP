import { randomUUID } from "node:crypto";
import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
const conflict = (message) =>
  Object.assign(new Error(message), { status: 409 });
export const transfersModel = {
  async list(query = {}) {
    const where = { movementType: "transfer_out" };
    if (query.fromWarehouseId)
      where.warehouseId = String(query.fromWarehouseId);
    const search = String(query.search ?? "")
      .trim()
      .replace(/[\\%_]/g, "\\$&");
    if (search)
      where.OR = [
        { reference: { contains: search } },
        { product: { name: { contains: search } } },
        { product: { sku: { contains: search } } },
        { product: { barcode: { contains: search } } },
      ];
    const start = query.startAt ? new Date(String(query.startAt)) : null;
    const end = query.endAt ? new Date(String(query.endAt)) : null;
    if (
      (start && !Number.isFinite(start.getTime())) ||
      (end && !Number.isFinite(end.getTime())) ||
      (start && end && start >= end)
    )
      throw Object.assign(new Error("Invalid transfer date range."), {
        status: 400,
      });
    if (start || end)
      where.occurredAt = {
        ...(start && { gte: start }),
        ...(end && { lt: end }),
      };
    if (query.toWarehouseId) {
      const destinations = await prisma.inventoryMovement.findMany({
        where: {
          movementType: "transfer_in",
          warehouseId: String(query.toWarehouseId),
          ...(where.occurredAt && { occurredAt: where.occurredAt }),
        },
        select: { reference: true },
      });
      where.reference = {
        in: destinations.map((item) => item.reference).filter(Boolean),
      };
    }
    const result = await paginate(query, "inventoryMovement", {
      where,
      include: { product: true, warehouse: true },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    });
    const items = Array.isArray(result) ? result : result.items;
    const references = items.map((item) => item.reference).filter(Boolean);
    const incoming = references.length
      ? await prisma.inventoryMovement.findMany({
          where: { movementType: "transfer_in", reference: { in: references } },
          include: { warehouse: true },
        })
      : [];
    const mapped = items.map((item) => ({
      ...item,
      quantity: Math.abs(item.quantity),
      toWarehouse:
        incoming.find((entry) => entry.reference === item.reference)
          ?.warehouse ?? null,
    }));
    return Array.isArray(result) ? mapped : { ...result, items: mapped };
  },
  async create(input, db = prisma) {
    return db.$transaction(async (tx) => {
      const ids = [
        ...new Set([
          input.toWarehouseId,
          ...input.items.map((item) => item.fromWarehouseId),
        ]),
      ];
      const warehouses = await tx.inventoryWarehouse.count({
        where: { id: { in: ids } },
      });
      if (warehouses !== ids.length)
        throw conflict("Storage no longer exists.");
      const result = [];
      for (const item of input.items) {
        const product = await tx.inventoryProduct.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.status !== "active")
          throw conflict("Product is unavailable.");
        const debited = await tx.inventoryStock.updateMany({
          where: {
            productId: item.productId,
            warehouseId: item.fromWarehouseId,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (debited.count !== 1)
          throw conflict(`Insufficient stock for ${product.name}.`);
        await tx.inventoryStock.upsert({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: input.toWarehouseId,
            },
          },
          update: { quantity: { increment: item.quantity } },
          create: {
            productId: item.productId,
            warehouseId: input.toWarehouseId,
            quantity: item.quantity,
          },
        });
        const reference = `TR-${randomUUID()}`;
        const occurredAt = new Date();
        await tx.inventoryMovement.createMany({
          data: [
            {
              productId: item.productId,
              warehouseId: item.fromWarehouseId,
              movementType: "transfer_out",
              quantity: -item.quantity,
              reference,
              occurredAt,
            },
            {
              productId: item.productId,
              warehouseId: input.toWarehouseId,
              movementType: "transfer_in",
              quantity: item.quantity,
              reference,
              occurredAt,
            },
          ],
        });
        result.push({ reference });
      }
      return result;
    });
  },
};
