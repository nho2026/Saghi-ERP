import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { inventoryAction as action } from "../shared/inventory.controller.js";
import { manage } from "../shared/inventory.permissions.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { listThresholds } from "./threshold.service.js";
const router = Router();
const qty = z.number().finite().min(0).max(1000000000);
const schema = z.object({
  reorderLevel: qty,
  anesthesiaMinimum: qty,
  scrubNurseMinimum: qty,
  perfusionMinimum: qty,
  cardiologyMinimum: qty,
});
router.get(
  "/thresholds",
  requirePermission("inventory.view"),
  action(listThresholds),
);
router.patch(
  "/thresholds/:id",
  manage,
  action(({ id, body }) =>
    prisma.inventoryStock.update({ where: { id }, data: schema.parse(body) }),
  ),
);
export default router;
