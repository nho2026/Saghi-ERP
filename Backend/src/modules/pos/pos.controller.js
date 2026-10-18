import { posService } from "./pos.service.js";
const run = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res)).catch(next);
export const posController = {
  list: run(async (req, res) => res.json(await posService.list(req.query))),
  create: run(async (req, res) =>
    res.status(201).json(await posService.create(req.body, req.user.name)),
  ),
  returnSale: run(async (req, res) =>
    res.json(await posService.returnSale(req.body)),
  ),
  cancel: run(async (req, res) =>
    res.json(
      await posService.cancel(req.params.id, req.body, req.user.passwordHash),
    ),
  ),
};
