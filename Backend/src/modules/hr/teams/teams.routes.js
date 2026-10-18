import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { teamController } from "./teams.controller.js";
import { teamSchema } from "./teams.schema.js";
const router = Router();
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, teamController.list);
router.post("/", manage, validate(teamSchema), teamController.create);
router.patch(
  "/:id",
  manage,
  validate(teamSchema.partial()),
  teamController.update,
);
router.delete("/:id", manage, teamController.remove);
export default router;
