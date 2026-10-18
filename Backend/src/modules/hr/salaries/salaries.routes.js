import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { salaryController } from "./salaries.controller.js";
import { salarySchema } from "./salaries.schema.js";
const router = Router();
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, salaryController.list);
router.post("/", manage, validate(salarySchema), salaryController.create);
router.patch(
  "/:id",
  manage,
  validate(salarySchema.partial()),
  salaryController.update,
);
router.delete("/:id", manage, salaryController.remove);
export default router;
