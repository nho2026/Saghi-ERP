import { roleService } from "./roles.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const roleController = {
  list: run(async (_q, res) => res.json(await roleService.list(_q.query))),
  create: run(async (req, res) =>
    res.status(201).json(await roleService.create(req.validatedBody)),
  ),
  update: run(async (req, res) =>
    res.json(await roleService.update(req.params.id, req.validatedBody)),
  ),
  assignPermissions: run(async (req, res) =>
    res.json(
      await roleService.assignPermissions(
        req.params.id,
        req.validatedBody.permissionIds,
      ),
    ),
  ),
  remove: run(async (req, res) => {
    await roleService.remove(req.params.id);
    res.status(204).end();
  }),
};
