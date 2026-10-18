import { permissionService } from "./permissions.service.js";
export const permissionController = {
  async list(_req, res, next) {
    try {
      res.json(await permissionService.list());
    } catch (error) {
      next(error);
    }
  },
};
