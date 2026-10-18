import { isDeepStrictEqual } from "node:util";
import { ordersModel } from "./orders.model.js";
import { ordersSchema, arrivalSchema } from "./orders.schema.js";
export async function saveOrder(model, body, id) {
  const input = (
    id ? ordersSchema.omit({ requestId: true }) : ordersSchema
  ).parse(body);
  const existing = id ? await model.find(id) : null;
  if (id && !existing)
    throw Object.assign(new Error("Order not found."), { status: 404 });
  if (id && !isDeepStrictEqual(body.originalItems, existing.items))
    throw Object.assign(new Error("Order changed. Reload and try again."), {
      status: 409,
    });
  if (!id) {
    const previous = await model.findRequest(input.requestId);
    if (previous) return previous;
  }
  const seen = new Set();
  for (const item of input.items) {
    if (id && item.originalIndex !== undefined) {
      if (!existing.items[item.originalIndex] || seen.has(item.originalIndex))
        throw Object.assign(new Error("Invalid order item reference."), {
          status: 400,
        });
      seen.add(item.originalIndex);
    }
  }
  if (existing)
    for (const [index, item] of existing.items.entries()) {
      const next = input.items.find((row) => row.originalIndex === index);
      if (
        item.arrived &&
        (!next ||
          next.productId !== item.productId ||
          next.isNew !== item.isNew ||
          next.quantity !== item.quantity ||
          (item.isNew && next.name !== item.name))
      )
        throw Object.assign(
          new Error(
            "Unmark arrived items before removing them or changing their product or quantity.",
          ),
          { status: 409 },
        );
    }
  const ids = [
    ...new Set(
      input.items.filter((item) => !item.isNew).map((item) => item.productId),
    ),
  ];
  const products = await model.products(ids);
  if (products.length !== ids.length)
    throw Object.assign(new Error("Select active products."), { status: 400 });
  const items = input.items.map((item) => {
    const product = item.isNew
      ? null
      : products.find((p) => p.id === item.productId);
    const { originalIndex, ...details } = item;
    const previous = existing?.items[originalIndex];
    return {
      ...details,
      ...(existing && {
        arrived: previous?.arrived ?? false,
        arrivedAt: previous?.arrivedAt ?? null,
      }),
      productId: product?.id ?? null,
      name: product?.name ?? item.name,
      imageUrl:
        item.imageUrl ??
        product?.images?.find((image) => image.isMain)?.imageUrl ??
        product?.images?.[0]?.imageUrl ??
        null,
      totalPrice:
        Math.round(item.quantity * Math.round(item.price * 100)) / 100,
    };
  });
  const cents = items.reduce(
    (sum, item) => sum + Math.round(item.totalPrice * 100),
    0,
  );
  if (!Number.isSafeInteger(cents))
    throw Object.assign(new Error("Order total is too large."), {
      status: 400,
    });
  if (id) {
    const data = {
      name: input.name,
      note: input.note,
      items,
      totalPrice: cents / 100,
    };
    const updated = await model.update(id, existing, data);
    if (updated.count !== 1)
      throw Object.assign(new Error("Order changed. Reload and try again."), {
        status: 409,
      });
    return { ...existing, ...data };
  }
  try {
    return await model.create({ ...input, items, totalPrice: cents / 100 });
  } catch (error) {
    if (error.code === "P2002") {
      const saved = await model.findRequest(input.requestId);
      if (saved) return saved;
    }
    throw error;
  }
}
export async function markOrderArrival(model, id, body) {
  const { index, arrived } = arrivalSchema.parse(body);
  const order = await model.find(id);
  if (!order)
    throw Object.assign(new Error("Order not found."), { status: 404 });
  if (index >= order.items.length)
    throw Object.assign(new Error("Order item not found."), { status: 400 });
  const items = order.items.map((item, i) =>
    i === index
      ? {
          ...item,
          arrived,
          arrivedAt: arrived
            ? (item.arrivedAt ?? new Date().toISOString())
            : null,
        }
      : item,
  );
  const updated = await model.updateArrival(id, order.items, items);
  if (updated.count !== 1)
    throw Object.assign(new Error("Order changed. Reload and try again."), {
      status: 409,
    });
  return { ...order, items };
}
export const ordersService = {
  arrival: ({ id, body }) => markOrderArrival(ordersModel, id, body),
  remove: async ({ id }) => {
    await ordersModel.remove(id);
  },
  update: ({ id, body }) => saveOrder(ordersModel, body, id),
  create: ({ body }) => saveOrder(ordersModel, body),
  list: ({ query }) => ordersModel.list(query),
};
