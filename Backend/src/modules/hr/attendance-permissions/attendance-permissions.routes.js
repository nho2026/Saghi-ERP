import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { attendancePermissionController } from "./attendance-permissions.controller.js";
import {
  attendancePermissionSchema,
  attendancePermissionUpdateSchema,
} from "./attendance-permissions.schema.js";
const router = Router();
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, attendancePermissionController.list);
router.post(
  "/",
  manage,
  validate(attendancePermissionSchema),
  attendancePermissionController.create,
);
router.patch(
  "/:id",
  manage,
  validate(attendancePermissionUpdateSchema),
  attendancePermissionController.update,
);
router.delete("/:id", manage, attendancePermissionController.remove);
export default router;
