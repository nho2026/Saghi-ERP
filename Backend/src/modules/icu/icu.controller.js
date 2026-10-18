import { icuService as service } from "./icu.service.js";

const run =
  (handler, status = 200) =>
  async (req, res, next) => {
    try {
      res.status(status).json(await handler(req));
    } catch (error) {
      next(error);
    }
  };

export const icuController = {
  dashboard: run(() => service.dashboard()),
  cases: run((req) => service.cases(req.query)),
  staff: run(() => service.staff()),
  operationTypes: run(() => service.operationTypes()),
  createOperationType: run(
    (req) => service.createOperationType(req.validatedBody),
    201,
  ),
  updateOperationType: run((req) =>
    service.updateOperationType(req.params.id, req.validatedBody),
  ),
  storage: run(() => service.storage()),
  products: run((req) => service.products(req.query)),
  itemReductions: run((req) => service.itemReductions(req.query)),
  createItemReduction: run(
    (req) => service.createItemReduction(req.validatedBody),
    201,
  ),
};
