import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { employeeController } from "./employees.controller.js";
import { employeeSchema } from "./employees.schema.js";
const router = Router();
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, employeeController.list);
router.post("/", manage, validate(employeeSchema), employeeController.create);
router.patch(
  "/:id",
  manage,
  validate(employeeSchema.partial()),
  employeeController.update,
);
router.delete("/:id", manage, employeeController.remove);
export default router;
