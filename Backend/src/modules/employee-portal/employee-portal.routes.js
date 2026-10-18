import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { employeePortalController } from "./employee-portal.controller.js";
import { employeeIdeaSchema } from "./employee-portal.schema.js";

const router = Router();
router.use(requireAuth);
router.get("/my-tasks", employeePortalController.myTasks);
router.get("/ideas", employeePortalController.ideas);
router.post(
  "/ideas",
  validate(employeeIdeaSchema),
  employeePortalController.createIdea,
);
router.get("/warnings", employeePortalController.warnings);
export default router;
