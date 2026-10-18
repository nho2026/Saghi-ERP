import { referralService } from "./referral.service.js";

const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

export const referralController = {
  list: handle(async (req, res) =>
    res.json(await referralService.list(req.query)),
  ),
  create: handle(async (req, res) =>
    res.status(201).json(await referralService.create(req.validatedBody)),
  ),
  update: handle(async (req, res) =>
    res.json(await referralService.update(req.params.id, req.validatedBody)),
  ),
  remove: handle(async (req, res) => {
    await referralService.remove(req.params.id);
    res.status(204).end();
  }),
};
