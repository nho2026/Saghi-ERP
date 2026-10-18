import { Router } from "express";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { payrollAdjustmentController } from "./payroll-adjustments.controller.js";
import { payrollAdjustmentSchema } from "./payroll-adjustments.schema.js";

const router = Router();
const view = requirePermission("employees.view");
const process = requirePermission("payroll.process");

router.get("/", view, payrollAdjustmentController.list);
router.post(
  "/",
  process,
  validate(payrollAdjustmentSchema),
  payrollAdjustmentController.create,
);
router.patch(
  "/:id",
  process,
  validate(payrollAdjustmentSchema.partial()),
  payrollAdjustmentController.update,
);
router.delete("/:id", process, payrollAdjustmentController.remove);

export default router;
