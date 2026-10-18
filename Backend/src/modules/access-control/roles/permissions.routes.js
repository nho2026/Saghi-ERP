import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { permissionController } from "./permissions.controller.js";
const router = Router();
router.use(requireAuth);
router.get(
  "/",
  requirePermission("permissions.view"),
  permissionController.list,
);
export default router;
