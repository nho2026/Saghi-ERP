import { Router } from "express";
import { inventoryAction } from "../shared/inventory.controller.js";
import { adjust } from "../shared/inventory.permissions.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { createReduction, listReductions } from "./reductions.service.js";
const router = Router();
router.get(
  "/item-reductions",
  requirePermission("inventory.view"),
  inventoryAction(listReductions),
);
router.post("/item-reductions", adjust, inventoryAction(createReduction, 201));
export default router;
