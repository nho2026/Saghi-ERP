import { feedbackModel as model } from "./feedback.model.js";
const page = (q) => ({
  page: Math.max(1, Number(q.page) || 1),
  pageSize: Math.min(100, Math.max(1, Number(q.pageSize) || 50)),
});
const whereFrom = (q, publicOnly = false) => ({
  ...(!publicOnly && q.status && { status: String(q.status) }),
  ...(publicOnly && { status: "approved" }),
  ...(q.targetType && { targetType: String(q.targetType) }),
  ...(q.targetId && String(q.targetType) === "product"
    ? { productId: String(q.targetId) }
    : q.targetId
      ? { serviceId: String(q.targetId) }
      : {}),
  ...(q.rating && { rating: Number(q.rating) }),
});
export const feedbackService = {
  list: (q, publicOnly = false) => {
    const p = page(q);
    return model.page(whereFrom(q, publicOnly), p.page, p.pageSize);
  },
  async create(input) {
    const { targetId, targetType, ...rest } = input;
    return model.create({
      ...rest,
      customerEmail: rest.customerEmail || null,
      targetType,
      ...(targetType === "product"
        ? { productId: targetId }
        : { serviceId: targetId }),
      status: "pending",
      source: "website",
    });
  },
  status: model.updateStatus,
  remove: model.remove,
  async targets() {
    return {
      products: await model.products(),
      services: await model.services(),
    };
  },
  services: model.allServices,
  createService: model.createService,
  updateService: model.updateService,
  removeService: model.removeService,
  async summary() {
    const rows = await model.summaries(),
      groups = new Map();
    for (const row of rows) {
      const id = row.productId ?? row.serviceId,
        key = `${row.targetType}:${id}`,
        current = groups.get(key) ?? {
          targetType: row.targetType,
          targetId: id,
          targetName: row.product?.name ?? row.service?.name,
          count: 0,
          total: 0,
        };
      current.count++;
      current.total += row.rating;
      groups.set(key, current);
    }
    const items = [...groups.values()]
      .map((x) => ({ ...x, average: Number((x.total / x.count).toFixed(2)) }))
      .sort((a, b) => b.average - a.average);
    const count = rows.length,
      average = count
        ? Number((rows.reduce((s, x) => s + x.rating, 0) / count).toFixed(2))
        : 0;
    return {
      average,
      count,
      distribution: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: rows.filter((x) => x.rating === rating).length,
      })),
      products: items.filter((x) => x.targetType === "product"),
      services: items.filter((x) => x.targetType === "service"),
    };
  },
};
