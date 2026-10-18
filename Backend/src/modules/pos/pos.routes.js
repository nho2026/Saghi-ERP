import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../shared/middleware/permission.middleware.js";
import { posController } from "./pos.controller.js";

const router = Router();
router.use(requireAuth);
const usePos = requirePermission("pos.use");
const requireSuperAdmin = (req, res, next) =>
  req.permissionKeys?.has("*")
    ? next()
    : res
        .status(403)
        .json({ message: "Only a Super Administrator can cancel sales." });

router.get("/sales", usePos, posController.list);
router.post("/sales", usePos, posController.create);
router.post("/sales/return", usePos, posController.returnSale);
router.post("/sales/:id/cancel", requireSuperAdmin, posController.cancel);

export default router;
