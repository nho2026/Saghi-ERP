import { prisma } from "../../shared/database/client.js";
const include = { warehouse: true, items: { include: { product: true } } };
const fail = (message, status) => {
  throw Object.assign(new Error(message), { status });
};
export const posModel = {
  list: (skip, take, where = {}, db = prisma) =>
    db.$transaction([
      db.posSale.findMany({
        where,
        include,
        orderBy: { soldAt: "desc" },
        skip,
        take,
      }),
      db.posSale.count({ where }),
    ]),
  create: (input, cashierName, db = prisma) =>
    db.$transaction(async (tx) => {
      const ids = [...new Set(input.items.map((item) => item.productId))];
      const products = await tx.inventoryProduct.findMany({
        where: { id: { in: ids }, status: "active" },
      });
      if (products.length !== ids.length)
        fail("One or more products are unavailable.", 409);
      const productMap = new Map(products.map((item) => [item.id, item]));
      const stocks = await tx.inventoryStock.findMany({
        where: { warehouseId: input.warehouseId, productId: { in: ids } },
      });
      const stockMap = new Map(stocks.map((item) => [item.productId, item]));
      for (const item of input.items)
        if ((stockMap.get(item.productId)?.quantity ?? 0) < item.quantity)
          fail(
            `Insufficient stock for ${productMap.get(item.productId)?.name ?? "product"}.`,
            409,
          );
      const now = new Date();
      const lines = input.items.map((item) => {
        const product = productMap.get(item.productId);
        const active =
          product.discountType &&
          product.discountValue > 0 &&
          (!product.discountStart || product.discountStart <= now) &&
          (!product.discountEnd || product.discountEnd >= now);
        const unitPrice = active
          ? product.discountType === "percentage"
            ? product.sellingPrice *
              (1 - Math.min(product.discountValue, 100) / 100)
            : Math.max(0, product.sellingPrice - product.discountValue)
          : product.sellingPrice;
        const beforeTax = unitPrice * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          taxRate: product.taxRate,
          lineTotal: beforeTax + (beforeTax * product.taxRate) / 100,
        };
      });
      const subtotal = lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      );
      const taxAmount = lines.reduce(
        (sum, line) => sum + line.lineTotal - line.unitPrice * line.quantity,
        0,
      );
      const totalAmount = Math.max(
        0,
        subtotal + taxAmount - input.discountAmount,
      );
      if (input.paidAmount < totalAmount)
        fail("Paid amount is less than the sale total.", 400);
      const sale = await tx.posSale.create({
        data: {
          saleNumber: `POS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          warehouseId: input.warehouseId,
          customerName: input.customerName,
          paymentMethod: input.paymentMethod,
          subtotal,
          discountAmount: input.discountAmount,
          taxAmount,
          totalAmount,
          paidAmount: input.paidAmount,
          changeAmount: input.paidAmount - totalAmount,
          cashierName,
          notes: input.notes,
          items: { create: lines },
        },
        include,
      });
      for (const item of input.items) {
        const deducted = await tx.inventoryStock.updateMany({
          where: {
            productId: item.productId,
            warehouseId: input.warehouseId,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (deducted.count !== 1)
          fail("Insufficient stock for this sale.", 409);
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            warehouseId: input.warehouseId,
            movementType: "sale",
            quantity: -item.quantity,
            reference: sale.saleNumber,
            notes: `POS sale ${sale.saleNumber}`,
          },
        });
      }
      return sale;
    }),
  returnSale: (where, db = prisma) =>
    db.$transaction(async (tx) => {
      const sale = await tx.posSale.findUniqueOrThrow({
        where,
        include: { items: true },
      });
      if (sale.status === "cancelled") fail("Sale is already cancelled.", 409);
      const claimed = await tx.posSale.updateMany({
        where: { id: sale.id, status: sale.status },
        data: { status: "cancelled" },
      });
      if (claimed.count !== 1)
        fail(
          "Sale was already returned or changed. Refresh and try again.",
          409,
        );
      for (const item of sale.items) {
        await tx.inventoryStock.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: sale.warehouseId,
            },
          },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            warehouseId: sale.warehouseId,
            movementType: "sale_cancelled",
            quantity: item.quantity,
            reference: sale.saleNumber,
          },
        });
      }
      return tx.posSale.update({
        where: { id: sale.id },
        data: { status: "cancelled" },
        include,
      });
    }),
};
