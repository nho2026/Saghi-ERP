import { advancesService } from "./advances.service.js";
const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
export const advancesController = {
  listSalary: handle(async (_req, res) =>
    res.json(await advancesService.listSalary(_req.query)),
  ),
  createSalary: handle(async (req, res) =>
    res.status(201).json(await advancesService.createSalary(req.validatedBody)),
  ),
  updateSalary: handle(async (req, res) =>
    res.json(
      await advancesService.updateSalary(req.params.id, req.validatedBody),
    ),
  ),
  deleteSalary: handle(async (req, res) => {
    await advancesService.deleteSalary(req.params.id);
    res.status(204).end();
  }),
  listService: handle(async (_req, res) =>
    res.json(await advancesService.listService(_req.query)),
  ),
  createService: handle(async (req, res) =>
    res
      .status(201)
      .json(await advancesService.createService(req.validatedBody)),
  ),
  updateService: handle(async (req, res) =>
    res.json(
      await advancesService.updateService(req.params.id, req.validatedBody),
    ),
  ),
  deleteService: handle(async (req, res) => {
    await advancesService.deleteService(req.params.id);
    res.status(204).end();
  }),
};
