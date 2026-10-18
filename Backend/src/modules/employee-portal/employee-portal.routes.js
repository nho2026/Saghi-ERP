import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { employeePortalController } from "./employee-portal.controller.js";
import {
  employeeIdeaSchema,
  myAttendanceQuerySchema,
} from "./employee-portal.schema.js";

const router = Router();
router.use(requireAuth);
router.get("/my-attendance", (req, res, next) => {
  const result = myAttendanceQuerySchema.safeParse(req.query);
  if (!result.success)
    return res
      .status(422)
      .json({ message: "Select a valid attendance month." });
  req.attendanceQuery = result.data;
  return employeePortalController.myAttendance(req, res, next);
});
router.get("/my-tasks", employeePortalController.myTasks);
router.get("/ideas", employeePortalController.ideas);
router.post(
  "/ideas",
  validate(employeeIdeaSchema),
  employeePortalController.createIdea,
);
router.get("/warnings", employeePortalController.warnings);
export default router;
