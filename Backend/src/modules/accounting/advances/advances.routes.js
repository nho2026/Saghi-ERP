import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { advancesController } from "./advances.controller.js";
import {
  salaryAdvanceSchema,
  serviceAdvanceSchema,
} from "./advances.schema.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/salary",
  requirePermission("employees.view"),
  advancesController.listSalary,
);
router.post(
  "/salary",
  requirePermission("employees.manage"),
  validate(salaryAdvanceSchema),
  advancesController.createSalary,
);
router.patch(
  "/salary/:id",
  requirePermission("employees.manage"),
  validate(salaryAdvanceSchema.partial()),
  advancesController.updateSalary,
);
router.delete(
  "/salary/:id",
  requirePermission("employees.manage"),
  advancesController.deleteSalary,
);

router.get(
  "/service",
  requireAnyPermission("accounting.service_advances.view", "finance.view"),
  advancesController.listService,
);
router.post(
  "/service",
  requireAnyPermission("accounting.service_advances.create", "journal.create"),
  validate(serviceAdvanceSchema),
  advancesController.createService,
);
router.patch(
  "/service/:id",
  requireAnyPermission("accounting.service_advances.update", "journal.create"),
  validate(serviceAdvanceSchema.partial()),
  advancesController.updateService,
);
router.delete(
  "/service/:id",
  requireAnyPermission("accounting.service_advances.delete", "journal.create"),
  advancesController.deleteService,
);

export default router;
