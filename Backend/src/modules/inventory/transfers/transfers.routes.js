import { Router } from "express";
import { view, manage } from "../shared/inventory.permissions.js";
import { transfersController } from "./transfers.controller.js";
const router = Router();
router.get("/transfers", view, transfersController.list);
router.post("/transfers", manage, transfersController.create);
export default router;
