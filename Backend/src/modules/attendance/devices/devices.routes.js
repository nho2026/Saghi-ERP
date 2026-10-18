import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { deviceController as c } from "./devices.controller.js";
import { deviceSchema, adminPasswordSchema } from "./devices.schema.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
const router = Router(),
  view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, c.list);
router.post("/", manage, validate(deviceSchema), c.create);
router.patch("/:id", manage, validate(deviceSchema.partial()), c.update);
router.delete("/:id", manage, validate(adminPasswordSchema), c.remove);
router.delete(
  "/:id/events",
  manage,
  validate(adminPasswordSchema),
  c.clearEvents,
);
router.post("/:id/test", manage, c.test);
export default router;
