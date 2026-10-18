import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { attendanceController } from "./attendance.controller.js";
import { attendanceSchema } from "./attendance.schema.js";
import { monthlyReport } from "../reports/monthly-report.js";
const router = Router();
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get(
  "/monthly-report",
  view,
  requirePermission("hr.employees.view"),
  requirePermission("attendance.events.view"),
  requirePermission("hr.attendance-permissions.view"),
  async (req, res, next) => {
    try {
      res.json(await monthlyReport(req.query));
    } catch (error) {
      next(error);
    }
  },
);
router.get("/", view, attendanceController.list);
router.post(
  "/",
  manage,
  validate(attendanceSchema),
  attendanceController.create,
);
router.patch(
  "/:id",
  manage,
  validate(attendanceSchema.partial()),
  attendanceController.update,
);
router.delete("/:id", manage, attendanceController.remove);
export default router;
