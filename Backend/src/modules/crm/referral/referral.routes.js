import { requireRequestPermission } from "../../../shared/middleware/permission.middleware.js";
import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { referralController } from "./referral.controller.js";
import { referralSchema } from "./referral.schema.js";

const router = Router();
const canView = requireRequestPermission;
const canManage = requireRequestPermission;

router.get("/", canView, referralController.list);
router.post(
  "/",
  canManage,
  validate(referralSchema),
  referralController.create,
);
router.patch(
  "/:id",
  canManage,
  validate(referralSchema.partial()),
  referralController.update,
);
router.delete("/:id", canManage, referralController.remove);

export default router;
