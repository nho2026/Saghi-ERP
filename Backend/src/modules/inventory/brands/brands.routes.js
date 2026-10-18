import { Router } from "express";
import { view, manage } from "../shared/inventory.permissions.js";
import { brandsController } from "./brands.controller.js";
const router = Router();
router.get("/brands", view, brandsController.list);
router.post("/brands", manage, brandsController.create);
router.patch("/brands/:id", manage, brandsController.update);
router.delete("/brands/:id", manage, brandsController.remove);
export default router;
