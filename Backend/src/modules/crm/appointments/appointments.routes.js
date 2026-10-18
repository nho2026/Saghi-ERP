import { Router } from "express";
import {
  requirePermission,
  requireAnyPermission,
} from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { appointmentsController } from "./appointments.controller.js";
import {
  appointmentSchema,
  appointmentCreateSchema,
} from "./appointments.schema.js";

const router = Router();
const canViewAppointments = requirePermission("employees.view");
const canManageAppointments = requirePermission("employees.manage");

router.patch(
  "/:id/served",
  canManageAppointments,
  appointmentsController.serve,
);
router.get(
  "/today",
  requireAnyPermission("healthcare.appointments.view", "employees.view"),
  appointmentsController.today,
);
router.get(
  "/:id/profile-candidates",
  requirePermission("employees.view"),
  appointmentsController.profileCandidates,
);
router.get("/", canViewAppointments, appointmentsController.list);
router.post(
  "/",
  canManageAppointments,
  validate(appointmentCreateSchema),
  appointmentsController.create,
);
router.patch(
  "/:id",
  canManageAppointments,
  validate(appointmentSchema.partial()),
  appointmentsController.update,
);
router.delete("/:id", canManageAppointments, appointmentsController.remove);

export default router;
