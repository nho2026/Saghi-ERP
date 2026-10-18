import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { positionController } from "./positions.controller.js";
import { positionSchema } from "./positions.schema.js";
const router = Router();
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, positionController.list);
router.post("/", manage, validate(positionSchema), positionController.create);
router.patch(
  "/:id",
  manage,
  validate(positionSchema.partial()),
  positionController.update,
);
router.delete("/:id", manage, positionController.remove);
export default router;
