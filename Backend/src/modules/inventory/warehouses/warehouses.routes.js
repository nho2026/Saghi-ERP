import { Router } from "express";
import { manage, viewForPos } from "../shared/inventory.permissions.js";
import { warehousesController } from "./warehouses.controller.js";
const router = Router();
router.get("/warehouses", viewForPos, warehousesController.list);
router.post("/warehouses", manage, warehousesController.create);
router.patch("/warehouses/:id", manage, warehousesController.update);
router.delete("/warehouses/:id", manage, warehousesController.remove);
export default router;
