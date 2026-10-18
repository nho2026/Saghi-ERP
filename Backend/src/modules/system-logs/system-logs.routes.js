import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middleware/permission.middleware.js";
import { systemLogsController } from "./system-logs.controller.js";

const router = Router();
router.use(requireAuth, requireAnyPermission("system.logs.view", "roles.view"));
router.get("/", systemLogsController.list);

export default router;
