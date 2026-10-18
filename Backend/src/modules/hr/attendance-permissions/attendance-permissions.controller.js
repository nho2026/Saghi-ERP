import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { attendancePermissionService } from "./attendance-permissions.service.js";
export const attendancePermissionController = {
  ...createCrudController(attendancePermissionService),
  async remove(req, res, next) {
    try {
      await attendancePermissionService.remove(
        req.params.id,
        req.user,
        req.body?.password,
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
