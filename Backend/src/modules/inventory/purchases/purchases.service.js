import { productsService } from "../products/products.service.js";
import { purchaseFiltersWhere } from "./purchase-filters.js";
import { verifySecret } from "../../../shared/security/password.js";
import { prisma } from "../../../shared/database/client.js";
import { purchasesModel } from "./purchases.model.js";
import {
  purchaseSchema,
  purchaseEditSchema,
  paymentSchema,
  debtStatusSchema,
  returnPurchaseSchema,
} from "./purchases.schema.js";
import { pageInput } from "../shared/pagination.schema.js";
export async function savePurchase(db, input, id) {
  let previousAttachment;
  const saved = await db.$transaction(async (tx) => {
    let existing;
    if (id) {
      await tx.$queryRaw`SELECT id FROM inventory_InventoryPurchase WHERE id = ${id} FOR UPDATE`;
      existing = await tx.inventoryPurchase.findUnique({ where: { id } });
      if (!existing)
        throw Object.assign(new Error("Purchase not found."), { status: 404 });
      previousAttachment = existing.attachmentUrl;
      if (existing.status !== "completed")
        throw Object.assign(
          new Error("Only completed purchases can be edited."),
          { status: 409 },
        );
    } else {
      const previous = await tx.inventoryPurchase.findUnique({
        where: { requestId: input.requestId },
      });
      if (previous) return previous;
    }
    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const warehouseIds = [
      ...new Set(input.items.map((item) => item.warehouseId)),
    ];
    const [products, warehouses] = await Promise.all([
      tx.inventoryProduct.findMany({
        where: { id: { in: productIds } },
      }),
      tx.inventoryWarehouse.findMany({
        where: { id: { in: warehouseIds } },
      }),
    ]);
    // Retain invoice snapshots for catalog records that were removed after purchase.
    const missingProducts = new Set(
      productIds.filter((key) => !products.some((row) => row.id === key)),
    );
    const missingWarehouses = new Set(
      warehouseIds.filter((key) => !warehouses.some((row) => row.id === key)),
    );
    for (const key of missingProducts) {
      const original = existing?.items.find((row) => row.productId === key);
      if (!original)
        throw Object.assign(
          new Error(
            `Product ${key} no longer exists. Select an active product.`,
          ),
          { status: 400 },
        );
      products.push({
        id: key,
        name: original.productName ?? key,
        unit:
          original.unit ??
          input.items.find((row) => row.productId === key)?.unit ??
          "item",
        status: "historical",
      });
    }
    for (const key of missingWarehouses) {
      const original = existing?.items.find((row) => row.warehouseId === key);
      if (!original)
        throw Object.assign(
          new Error(
            `Storage ${key} no longer exists. Select an active storage location.`,
          ),
          { status: 400 },
        );
      warehouses.push({
        id: key,
        name: original.warehouseName ?? key,
        status: "historical",
      });
    }
    const originalQuantities = new Map();
    for (const item of existing?.items ?? []) {
      const key = JSON.stringify([item.productId, item.warehouseId]);
      originalQuantities.set(
        key,
        (originalQuantities.get(key) ?? 0) + Number(item.quantity),
      );
    }
    const submittedQuantities = new Map();
    for (const item of input.items) {
      const key = JSON.stringify([item.productId, item.warehouseId]);
      submittedQuantities.set(
        key,
        (submittedQuantities.get(key) ?? 0) + item.quantity,
      );
    }
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId);
      const warehouse = warehouses.find((w) => w.id === item.warehouseId);
      const key = JSON.stringify([item.productId, item.warehouseId]);
      if (
        (missingProducts.has(item.productId) ||
          missingWarehouses.has(item.warehouseId)) &&
        Math.abs(
          submittedQuantities.get(key) - (originalQuantities.get(key) ?? 0),
        ) > 1e-9
      ) {
        throw Object.assign(
          new Error(
            `Historical item ${product.name} in ${warehouse.name} references a removed product or storage location. Keep its product, storage and quantity unchanged to edit invoice details or the attachment.`,
          ),
          { status: 400 },
        );
      }
      if (
        (product.status !== "active" || warehouse.status !== "active") &&
        submittedQuantities.get(key) > (originalQuantities.get(key) ?? 0)
      ) {
        throw Object.assign(
          new Error(
            `${product.status !== "active" ? `Product ${product.name}` : `Storage ${warehouse.name}`} is inactive. Existing invoice items may be kept or reduced, but new purchases, increases and storage changes require active products and storage locations.`,
          ),
          { status: 400 },
        );
      }
    }
    for (const item of existing?.items ?? []) {
      const key = JSON.stringify([item.productId, item.warehouseId]);
      if (
        !submittedQuantities.has(key) &&
        (!products.some(
          (row) => row.id === item.productId && row.status !== "historical",
        ) ||
          !warehouses.some(
            (row) => row.id === item.warehouseId && row.status !== "historical",
          ))
      ) {
        // Removed lines are checked against the actual catalog, not just submitted IDs.
        const [product, warehouse] = await Promise.all([
          tx.inventoryProduct.findUnique({
            where: { id: item.productId },
            select: { id: true },
          }),
          tx.inventoryWarehouse.findUnique({
            where: { id: item.warehouseId },
            select: { id: true },
          }),
        ]);
        if (!product || !warehouse)
          throw Object.assign(
            new Error(
              "Cannot remove a historical item whose product or storage no longer exists. Keep invoice items unchanged to edit invoice details or the attachment.",
            ),
            { status: 400 },
          );
      }
    }
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId);
      if (
        item.unit &&
        item.unit.toLowerCase() !== product.unit.trim().toLowerCase()
      ) {
        throw Object.assign(
          new Error(
            `Unit for ${product.name} must match its stock unit (${product.unit}). Unit conversion is not configured.`,
          ),
          { status: 400 },
        );
      }
    }
    const items = input.items.map((item) => ({
      ...item,
      productName: products.find((p) => p.id === item.productId).name,
      unit: products.find((p) => p.id === item.productId).unit,
      warehouseName: warehouses.find((w) => w.id === item.warehouseId).name,
      totalPrice:
        Math.round(item.quantity * Math.round(item.price * 100)) / 100,
    }));
    const totalPrice =
      items.reduce((sum, item) => sum + Math.round(item.totalPrice * 100), 0) /
      100;
    if (!Number.isSafeInteger(Math.round(totalPrice * 100)))
      throw new Error("Purchase total is too large.");
    if (
      existing &&
      (Math.round(Number(existing.paidAmount) * 100) >
        Math.round(totalPrice * 100) ||
        (Number(existing.paidAmount) > 0 && !input.isDebt))
    ) {
      throw Object.assign(
        new Error("Purchase changes conflict with recorded payments."),
        { status: 409 },
      );
    }
    const { requestId, ...details } = input;
    const data = {
      ...details,
      hasInvoice: input.hasInvoice ?? Boolean(input.attachmentUrl),
      attachmentUrl: input.hasInvoice === false ? null : details.attachmentUrl,
      buyDate: new Date(input.buyDate),
      items,
      totalPrice,
    };
    const purchase = existing
      ? await tx.inventoryPurchase.update({ where: { id }, data })
      : await tx.inventoryPurchase.create({ data: { ...data, requestId } });
    const quantities = new Map();
    for (const [rows, sign] of [
      [existing?.items ?? [], -1],
      [items, 1],
    ]) {
      for (const item of rows) {
        const key = JSON.stringify([item.productId, item.warehouseId]);
        const previous = quantities.get(key);
        quantities.set(key, {
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: (previous?.quantity ?? 0) + sign * Number(item.quantity),
        });
      }
    }
    for (const item of [...quantities.values()].sort((a, b) =>
      `${a.productId}:${a.warehouseId}`.localeCompare(
        `${b.productId}:${b.warehouseId}`,
      ),
    )) {
      if (Math.abs(item.quantity) < 1e-9) continue;
      if (item.quantity < 0) {
        const changed = await tx.inventoryStock.updateMany({
          where: {
            productId: item.productId,
            warehouseId: item.warehouseId,
            quantity: { gte: -item.quantity },
          },
          data: { quantity: { increment: item.quantity } },
        });
        if (changed.count !== 1) {
          const stock = await tx.inventoryStock.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: item.warehouseId,
              },
            },
            select: { quantity: true },
          });
          const original = existing.items.find(
            (row) =>
              row.productId === item.productId &&
              row.warehouseId === item.warehouseId,
          );
          throw Object.assign(
            new Error(
              `Insufficient stock for ${original?.productName ?? item.productId} in ${original?.warehouseName ?? item.warehouseId}: this edit requires removing ${-item.quantity} units, but only ${Number(stock?.quantity ?? 0)} are available. Keep the original product, storage and quantity to edit invoice details or the attachment. No changes were saved.`,
            ),
            { status: 409 },
          );
        }
      } else {
        await tx.inventoryStock.upsert({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: item.warehouseId,
            },
          },
          create: item,
          update: { quantity: { increment: item.quantity } },
        });
      }
      await tx.inventoryMovement.create({
        data: {
          ...item,
          movementType: existing
            ? item.quantity < 0
              ? "adjustment_out"
              : "adjustment_in"
            : "purchase",
          reference: input.invoiceNumber,
          notes: existing ? `Purchase edited (${id})` : input.note,
          occurredAt: existing ? new Date() : new Date(input.buyDate),
        },
      });
    }
    return purchase;
  });
  if (previousAttachment && previousAttachment !== saved.attachmentUrl) {
    try {
      await productsService.removeImage({
        body: { imageUrl: previousAttachment },
      });
    } catch (error) {
      console.warn(
        "Purchase saved, but previous invoice image cleanup failed:",
        error.message,
      );
    }
  }
  return saved;
}

export async function reversePurchase(db, id, status) {
  if (!["returned", "deleted"].includes(status))
    throw new Error("Invalid purchase action.");
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM inventory_InventoryPurchase WHERE id = ${id} FOR UPDATE`;
    const purchase = await tx.inventoryPurchase.findUnique({ where: { id } });
    if (!purchase) {
      const error = new Error("Purchase not found.");
      error.status = 404;
      throw error;
    }
    if (purchase.status === status) return purchase;
    if (!purchase.attachmentUrl && purchase.hasInvoice !== false) {
      throw Object.assign(
        new Error("Attach an invoice before changing purchase status."),
        { status: 409 },
      );
    }
    if (
      purchase.status === "deleted" ||
      (status === "returned" && purchase.status !== "completed")
    ) {
      const error = new Error("This purchase can no longer be returned.");
      error.status = 409;
      throw error;
    }
    if (Number(purchase.paidAmount ?? 0) > 0) {
      const error = new Error(
        "This purchase has recorded payments and cannot be returned or deleted.",
      );
      error.status = 409;
      throw error;
    }
    // Claim the transition before adjusting stock; concurrent actions cannot reverse twice.
    const claimed = await tx.inventoryPurchase.updateMany({
      where: { id, status: purchase.status, paidAmount: 0 },
      data: { status },
    });
    if (claimed.count !== 1) {
      const error = new Error("Purchase changed. Refresh and try again.");
      error.status = 409;
      throw error;
    }
    if (purchase.status === "completed") {
      const quantities = new Map();
      for (const item of purchase.items) {
        const key = JSON.stringify([item.productId, item.warehouseId]);
        const previous = quantities.get(key);
        quantities.set(key, {
          ...item,
          quantity: (previous?.quantity ?? 0) + item.quantity,
        });
      }
      for (const item of [...quantities.values()].sort((a, b) =>
        `${a.productId}:${a.warehouseId}`.localeCompare(
          `${b.productId}:${b.warehouseId}`,
        ),
      )) {
        const changed = await tx.inventoryStock.updateMany({
          where: {
            productId: item.productId,
            warehouseId: item.warehouseId,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (changed.count !== 1) {
          const stock = await tx.inventoryStock.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: item.warehouseId,
              },
            },
            select: { quantity: true },
          });
          const error = new Error(
            `Cannot ${status === "deleted" ? "delete" : "return"} this purchase: ${item.productName ?? item.productId} in ${item.warehouseName ?? item.warehouseId} requires reversing ${item.quantity} units, but only ${Number(stock?.quantity ?? 0)} are available. No changes were saved.`,
          );
          error.status = 409;
          error.code = "PURCHASE_INSUFFICIENT_STOCK";
          error.details = {
            product: item.productName ?? item.productId,
            warehouse: item.warehouseName ?? item.warehouseId,
            required: item.quantity,
            available: Number(stock?.quantity ?? 0),
          };
          throw error;
        }
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            warehouseId: item.warehouseId,
            quantity: -item.quantity,
            movementType: "adjustment_out",
            reference: purchase.invoiceNumber,
            notes:
              status === "returned"
                ? "Purchase returned to retailer"
                : "Purchase deleted (stock reversed)",
          },
        });
      }
    }
    return { ...purchase, status };
  });
}

export async function payPurchase(db, id, input) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM inventory_InventoryPurchase WHERE id = ${id} FOR UPDATE`;
    const previous = await tx.inventoryPurchasePayment.findUnique({
      where: { requestId: input.requestId },
    });
    if (previous) {
      if (previous.purchaseId !== id) {
        const error = new Error("Payment request belongs to another invoice.");
        error.status = 409;
        throw error;
      }
      return previous;
    }
    const purchase = await tx.inventoryPurchase.findUnique({ where: { id } });
    if (!purchase || !purchase.isDebt || purchase.status !== "completed") {
      const error = new Error("This invoice is not an active purchase debt.");
      error.status = 409;
      throw error;
    }
    const paid = Math.round(Number(purchase.paidAmount) * 100);
    const amount = Math.round(input.amount * 100);
    const total = Math.round(Number(purchase.totalPrice) * 100);
    if (paid + amount > total) {
      const error = new Error("Payment exceeds the remaining balance.");
      error.status = 400;
      throw error;
    }
    const changed = await tx.inventoryPurchase.updateMany({
      where: { id, status: "completed", paidAmount: purchase.paidAmount },
      data: { paidAmount: { increment: input.amount } },
    });
    if (changed.count !== 1) {
      const error = new Error("Invoice changed. Refresh and try again.");
      error.status = 409;
      throw error;
    }
    return tx.inventoryPurchasePayment.create({
      data: { ...input, purchaseId: id },
    });
  });
}

export const purchasesService = {
  debts: async ({ query = {}, id }) => {
    const search = String(query.search ?? "").trim();
    const status = debtStatusSchema.parse(query.status ?? "");
    const invoiceFilter = invoiceAvailability(query.hasInvoice);
    const where = {
      ...purchaseFiltersWhere(query),
      ...invoiceFilter,
      isDebt: true,
      status: "completed",
      ...(query.retailer && { retailer: String(query.retailer) }),
      ...(search && {
        OR: ["invoiceNumber", "retailer", "salesperson", "note"].map((key) => ({
          [key]: { contains: search },
        })),
      }),
      ...(status === "paid" && {
        paidAmount: { gte: purchasesModel.fields.totalPrice },
      }),
      ...(status === "unpaid" && {
        paidAmount: { lt: purchasesModel.fields.totalPrice },
      }),
      ...(status === "partial" && {
        paidAmount: { gt: 0, lt: purchasesModel.fields.totalPrice },
      }),
    };
    const { page, pageSize } = pageInput(query);
    const [items, total, sums] = await purchasesModel.$transaction([
      purchasesModel.findMany({
        where,
        include: { payments: { orderBy: { paidAt: "desc" } } },
        orderBy: [{ buyDate: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      purchasesModel.count({ where }),
      purchasesModel.aggregate({
        where,
        _sum: { totalPrice: true, paidAmount: true },
      }),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      summary: {
        totalPrice: sums._sum.totalPrice ?? 0,
        paidAmount: sums._sum.paidAmount ?? 0,
        outstanding:
          (Math.round(Number(sums._sum.totalPrice ?? 0) * 100) -
            Math.round(Number(sums._sum.paidAmount ?? 0) * 100)) /
          100,
      },
    };
  },
  pay: async ({ body, id }) => {
    try {
      return await payPurchase(purchasesModel, id, paymentSchema.parse(body));
    } catch (error) {
      if (error.code === "P2002") {
        const previous = await purchasesModel
          .findPayment({ where: { requestId: body.requestId } })
          .catch(() => null);
        if (previous?.purchaseId === id) return previous;
      }
      throw error;
    }
  },
  list: async ({ query = {}, id }) => {
    const search = String(query.search ?? "").trim();
    return await purchasesModel.paginate(query, "inventoryPurchase", {
      where: {
        ...invoiceAvailability(query.hasInvoice),
        status: { not: "deleted" },
        ...purchaseFiltersWhere(query),
        ...(query.retailer && { retailer: String(query.retailer) }),
        ...(search && {
          OR: ["retailer", "invoiceNumber", "note"].map((key) => ({
            [key]: { contains: search },
          })),
        }),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  },
  returnPurchase: async ({ id, body, passwordHash }) => {
    const { password } = returnPurchaseSchema.parse(body);
    if (!passwordHash || !(await verifySecret(password, passwordHash))) {
      throw Object.assign(new Error("The password is incorrect."), {
        status: 403,
      });
    }
    return await reversePurchase(purchasesModel, id, "returned");
  },
  remove: async ({ id, body, passwordHash }) => {
    const { password } = returnPurchaseSchema.parse(body);
    if (!passwordHash || !(await verifySecret(password, passwordHash))) {
      throw Object.assign(new Error("The password is incorrect."), {
        status: 403,
      });
    }
    return await reversePurchase(purchasesModel, id, "deleted");
  },
  retailers: async ({ query = {} } = {}) => {
    if (query.page !== undefined || query.pageSize !== undefined) {
      const { page, pageSize } = pageInput(query);
      const search = String(query.search ?? "").trim();
      return prisma.$transaction(async (tx) => {
        const [count] = await tx.$queryRaw`
          SELECT COUNT(*) AS total FROM (
            SELECT retailer AS name FROM inventory_InventoryPurchase
            UNION SELECT name FROM InventoryRetailer
          ) AS retailers WHERE LOCATE(${search}, name) > 0`;
        const total = Number(count.total);
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const currentPage = Math.min(page, totalPages);
        const rows = await tx.$queryRaw`
          SELECT name FROM (
            SELECT retailer AS name FROM inventory_InventoryPurchase
            UNION SELECT name FROM InventoryRetailer
          ) AS retailers WHERE LOCATE(${search}, name) > 0
          ORDER BY name LIMIT ${pageSize} OFFSET ${(currentPage - 1) * pageSize}`;
        return {
          items: rows.map((row) => row.name),
          pagination: { page: currentPage, pageSize, total, totalPages },
        };
      });
    }
    const rows = await purchasesModel.findMany({
      select: { retailer: true },
      distinct: ["retailer"],
      orderBy: { retailer: "asc" },
    });
    const retailers = await prisma.inventoryRetailer.findMany({
      select: { name: true },
    });
    return [
      ...new Set([
        ...rows.map((row) => row.retailer),
        ...retailers.map((row) => row.name),
      ]),
    ].sort();
  },
  update: async ({ id, body }) => {
    try {
      return await savePurchase(
        purchasesModel,
        purchaseEditSchema.parse(body),
        id,
      );
    } catch (error) {
      if (error.code === "P2002")
        throw Object.assign(
          new Error("This retailer invoice number already exists."),
          { status: 409 },
        );
      throw error;
    }
  },
  create: async ({ body }) => {
    try {
      return await savePurchase(purchasesModel, purchaseSchema.parse(body));
    } catch (error) {
      if (error.code === "P2002") {
        const previous = await purchasesModel
          .findUnique({ where: { requestId: body.requestId } })
          .catch(() => null);
        if (previous) return previous;
        throw Object.assign(
          new Error("This retailer invoice has already been recorded."),
          { status: 409 },
        );
      }
      throw error;
    }
  },
};

function invoiceAvailability(value) {
  if (value === undefined || value === "") return {};
  if (value !== "true" && value !== "false") {
    throw Object.assign(new Error("Invalid invoice availability filter."), {
      status: 400,
    });
  }
  return { hasInvoice: value === "true" };
}
