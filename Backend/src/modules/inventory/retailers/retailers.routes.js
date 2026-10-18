import { Router } from "express";
import { manage } from "../shared/inventory.permissions.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { retailersController } from "./retailers.controller.js";
const router = Router();
router.get(
  "/retailers",
  requirePermission("inventory.view"),
  retailersController.list,
);
router.post("/retailers", manage, retailersController.create);
router.patch("/retailers/:id", manage, retailersController.update);
router.delete("/retailers/:id", manage, retailersController.remove);
export default router;
