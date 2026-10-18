import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { roleController } from "./roles.controller.js";
import { roleSchema, permissionsSchema } from "./roles.schema.js";
const router = Router();
router.use(requireAuth);
router.get("/", requirePermission("roles.view"), roleController.list);
router.post(
  "/",
  requirePermission("roles.create"),
  validate(roleSchema),
  roleController.create,
);
router.patch(
  "/:id",
  requirePermission("roles.update"),
  validate(roleSchema.partial()),
  roleController.update,
);
router.put(
  "/:id/permissions",
  requirePermission("roles.assign_permissions"),
  validate(permissionsSchema),
  roleController.assignPermissions,
);
router.delete("/:id", requirePermission("roles.delete"), roleController.remove);
export default router;
