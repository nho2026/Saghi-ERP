import { userService } from "./users.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const userController = {
  list: run(async (_q, res) => res.json(await userService.list(_q.query))),
  create: run(async (req, res) =>
    res.status(201).json(await userService.create(req.validatedBody)),
  ),
  update: run(async (req, res) =>
    res.json(await userService.update(req.params.id, req.validatedBody)),
  ),
  unlockAttempts: run(async (req, res) => {
    await userService.unlockAttempts(req.params.id);
    res.status(204).end();
  }),
  remove: run(async (req, res) => {
    await userService.remove(req.params.id, req.user.id);
    res.status(204).end();
  }),
  changePassword: run(async (req, res) => {
    await userService.changePassword(
      req.params.id,
      req.user,
      req.validatedBody,
    );
    res.status(204).end();
  }),
};
