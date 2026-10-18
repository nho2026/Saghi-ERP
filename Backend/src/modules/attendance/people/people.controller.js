import { methodSchema } from "./people.schema.js";
import { peopleService as s } from "./people.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const peopleController = {
  list: run(async (req, res) =>
    res.json(
      await s.list(req.query.deviceId && String(req.query.deviceId), req.query),
    ),
  ),
  sync: run(async (req, res) =>
    res.json(await s.sync(req.validatedBody.deviceId)),
  ),
  create: run(async (req, res) =>
    res.status(201).json(await s.create(req.validatedBody)),
  ),
  update: run(async (req, res) =>
    res.json(await s.update(req.params.id, req.validatedBody)),
  ),
  remove: run(async (req, res) => {
    await s.remove(req.params.id, req.user, req.validatedBody.password);
    res.status(204).end();
  }),
  removeCredential: run(async (req, res) =>
    res.json(
      await s.removeCredential(
        req.params.id,
        methodSchema.parse(req.params.method),
      ),
    ),
  ),
  addCredential: run(async (req, res) =>
    res.json(
      await s.addCredential(
        req.params.id,
        methodSchema.parse(req.params.method),
        req.validatedBody,
      ),
    ),
  ),
};
