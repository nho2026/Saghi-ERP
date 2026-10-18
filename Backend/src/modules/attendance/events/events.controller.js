import { eventsService as s } from "./events.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const eventsController = {
  list: run(async (req, res) => res.json(await s.list(req.query))),
  sync: run(async (req, res) => res.json(await s.sync(req.validatedBody))),
};
