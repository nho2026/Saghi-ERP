import { cashFlowModel as model } from "./cash-flow.model.js";
import { cashFlowQuerySchema, cashFlowWhere } from "./cash-flow.schema.js";
export const cashFlowService = {
  list: (query) => {
    const q = cashFlowQuerySchema.parse(query);
    return model.findPage(q.page, q.pageSize, cashFlowWhere(q));
  },
  report: (query) =>
    model.report(cashFlowWhere(cashFlowQuerySchema.parse(query))),
  options: model.options,
  create: model.create,
  update: model.update,
  remove: model.remove,
};
