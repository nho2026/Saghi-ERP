import { prescriptionsService as service } from "./prescriptions.service.js";
const action = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
export const prescriptionsController = {
  list: action(async (req, res) =>
    res.json(await service.list(req.params.patientId)),
  ),
  catalog: action(async (req, res) => res.json(await service.catalog())),
  create: action(async (req, res) =>
    res
      .status(201)
      .json(await service.create(req.params.patientId, req.body, req.user)),
  ),
};
