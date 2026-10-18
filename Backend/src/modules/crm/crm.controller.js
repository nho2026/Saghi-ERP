import { crmService } from "./crm.service.js";

const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

export const crmController = {
  lookups: handle(async (_req, res) => res.json(await crmService.lookups())),
  list: handle(async (req, res) =>
    res.json(await crmService.list(req.params.resource, req.query)),
  ),
  create: handle(async (req, res) =>
    res
      .status(201)
      .json(await crmService.create(req.params.resource, req.validatedBody)),
  ),
  update: handle(async (req, res) =>
    res.json(
      await crmService.update(
        req.params.resource,
        req.params.id,
        req.validatedBody,
      ),
    ),
  ),
  delete: handle(async (req, res) => {
    await crmService.delete(req.params.resource, req.params.id);
    res.status(204).end();
  }),
};
