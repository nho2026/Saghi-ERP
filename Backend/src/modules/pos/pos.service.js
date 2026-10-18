import { verifySecret } from "../../shared/security/password.js";
import { posModel } from "./pos.model.js";
import { saleFiltersWhere } from "./pos-filters.js";
import {
  cancelSaleSchema,
  createSaleSchema,
  posSalesQuerySchema,
  returnSaleSchema,
} from "./pos.schema.js";
export const posService = {
  async list(raw) {
    const { page, pageSize, ...filters } = posSalesQuerySchema.parse(raw);
    const [items, total] = await posModel.list(
      (page - 1) * pageSize,
      pageSize,
      saleFiltersWhere(filters),
    );
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },
  create(raw, cashierName) {
    const input = createSaleSchema.parse(raw);
    input.items = [
      ...input.items
        .reduce((map, item) => {
          const current = map.get(item.productId);
          map.set(item.productId, {
            ...item,
            quantity: (current?.quantity ?? 0) + item.quantity,
          });
          return map;
        }, new Map())
        .values(),
    ];
    return posModel.create(input, cashierName);
  },
  returnSale(raw) {
    const { saleNumber } = returnSaleSchema.parse(raw);
    return posModel.returnSale({ saleNumber });
  },
  async cancel(id, raw, passwordHash) {
    const { password } = cancelSaleSchema.parse(raw);
    if (!(await verifySecret(password, passwordHash)))
      fail("The password is incorrect.", 403);
    return posModel.returnSale({ id });
  },
};
const fail = (message, status) => {
  throw Object.assign(new Error(message), { status });
};
