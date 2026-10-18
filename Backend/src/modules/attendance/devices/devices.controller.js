import { deviceService as service } from "./devices.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const deviceController = {
  list: run(async (req, res) => res.json(await service.list(req.query))),
  create: run(async (req, res) =>
    res.status(201).json(await service.create(req.validatedBody)),
  ),
  update: run(async (req, res) =>
    res.json(await service.update(req.params.id, req.validatedBody)),
  ),
  remove: run(async (req, res) => {
    await service.remove(req.params.id, req.user, req.validatedBody.password);
    res.status(204).end();
  }),
  clearEvents: run(async (req, res) =>
    res.json(
      await service.clearEvents(
        req.params.id,
        req.user,
        req.validatedBody.password,
      ),
    ),
  ),
  test: run(async (req, res) => res.json(await service.test(req.params.id))),
};
