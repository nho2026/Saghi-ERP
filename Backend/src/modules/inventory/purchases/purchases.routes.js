import { Router } from "express";
import { view, manage, adjust } from "../shared/inventory.permissions.js";
import { purchasesController } from "./purchases.controller.js";
const router = Router();
router.get("/purchase-debts", view, purchasesController.debts);
router.post("/purchases/:id/pay", manage, purchasesController.pay);
router.get("/purchases", view, purchasesController.list);
router.post(
  "/purchases/:id/return",
  adjust,
  purchasesController.returnPurchase,
);
router.delete("/purchases/:id", manage, adjust, purchasesController.remove);
router.get("/purchases/retailers", view, purchasesController.retailers);
router.patch("/purchases/:id", adjust, purchasesController.update);
router.post("/purchases", adjust, purchasesController.create);
export default router;
