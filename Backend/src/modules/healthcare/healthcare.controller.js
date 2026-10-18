import { healthcareService as service } from "./healthcare.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const healthcareController = {
  departments: run(async (_q, res) =>
    res.json(await service.listDepartments(_q.query)),
  ),
  createDepartment: run(async (req, res) =>
    res.status(201).json(await service.createDepartment(req.validatedBody)),
  ),
  updateDepartment: run(async (req, res) =>
    res.json(await service.updateDepartment(req.params.id, req.validatedBody)),
  ),
  removeDepartment: run(async (req, res) => {
    await service.removeDepartment(req.params.id);
    res.status(204).end();
  }),
  removeDepartments: run(async (req, res) =>
    res.json(await service.removeDepartments(req.validatedBody.ids)),
  ),
  staff: run(async (req, res) => res.json(await service.listStaff(req.query))),
  createStaff: run(async (req, res) =>
    res.status(201).json(await service.createStaff(req.validatedBody)),
  ),
  updateStaff: run(async (req, res) =>
    res.json(await service.updateStaff(req.params.id, req.validatedBody)),
  ),
  removeStaff: run(async (req, res) => {
    await service.removeStaff(req.params.id);
    res.status(204).end();
  }),
  publicDepartments: run(async (_q, res) =>
    res.json(await service.publicDepartments()),
  ),
  publicDoctors: run(async (req, res) =>
    res.json(await service.publicDoctors(req.query.departmentId)),
  ),
};
