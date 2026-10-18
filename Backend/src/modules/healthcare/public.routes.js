import { Router } from "express";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { healthcareController as c } from "./healthcare.controller.js";
import { appointmentsController } from "../crm/appointments/appointments.controller.js";
import { bookingSchema } from "../crm/appointments/appointments.schema.js";
const router = Router();
router.get("/departments", c.publicDepartments);
router.get("/doctors", c.publicDoctors);
router.post(
  "/appointments",
  validate(bookingSchema),
  appointmentsController.book,
);
export default router;
