import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../shared/middleware/permission.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { feedbackController as c } from "./feedback.controller.js";
import { statusSchema, serviceSchema } from "./feedback.schema.js";
const router = Router();
router.use(requireAuth, requirePermission("employees.view"));
router.get("/", c.adminList);
router.get("/summary", c.summary);
router.get("/services", c.services);
router.post(
  "/services",
  requirePermission("employees.manage"),
  validate(serviceSchema),
  c.createService,
);
router.patch(
  "/services/:id",
  requirePermission("employees.manage"),
  validate(serviceSchema.partial()),
  c.updateService,
);
router.delete(
  "/services/:id",
  requirePermission("employees.manage"),
  c.removeService,
);
router.patch(
  "/:id/status",
  requirePermission("employees.manage"),
  validate(statusSchema),
  c.status,
);
router.delete("/:id", requirePermission("employees.manage"), c.remove);
export default router;
