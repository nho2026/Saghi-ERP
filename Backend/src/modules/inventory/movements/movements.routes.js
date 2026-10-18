import { Router } from "express";
import { view } from "../shared/inventory.permissions.js";
import { movementsController } from "./movements.controller.js";
const router = Router();
router.get("/movements", view, movementsController.list);
export default router;
