import { Router } from "express";
import { view, manage } from "../shared/inventory.permissions.js";
import { categoriesController } from "./categories.controller.js";
const router = Router();
router.get("/categories", view, categoriesController.list);
router.post("/categories", manage, categoriesController.create);
router.patch("/categories/:id", manage, categoriesController.update);
router.delete("/categories/:id", manage, categoriesController.remove);
export default router;
