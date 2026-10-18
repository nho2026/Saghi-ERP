import { Router } from "express";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { patientProductsController } from "./patient-products.controller.js";
import { inventoryAction } from "../shared/inventory.controller.js";
import { listTopProducts } from "./top-products.service.js";
const router = Router();
router.get(
  "/top-products",
  requirePermission("inventory.top-products.view"),
  inventoryAction(listTopProducts),
);
router.get(
  "/reports/products-per-patient",
  requirePermission("inventory.view"),
  patientProductsController.list,
);
export default router;
