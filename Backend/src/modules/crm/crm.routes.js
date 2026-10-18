import { requireRequestPermission } from "../../shared/middleware/permission.middleware.js";
import prescriptionsRoutes from "./prescriptions/prescriptions.routes.js";
import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { crmController } from "./crm.controller.js";
import {
  crmSchemas,
  isCrmResource,
  patientUpdateSchema,
} from "./crm.schema.js";
import leadRoutes from "./lead/lead.routes.js";
import patientRoutes from "./patient/patient.routes.js";
import formsRoutes from "./forms/forms.routes.js";
import referralRoutes from "./referral/referral.routes.js";
import appointmentsRoutes from "./appointments/appointments.routes.js";

const router = Router();

const canView = requireRequestPermission;

const canManage = requireRequestPermission;

const validateResource =
  (partial = false) =>
  (req, res, next) =>
    validate(
      partial
        ? req.params.resource === "patients"
          ? patientUpdateSchema
          : crmSchemas[req.params.resource].partial()
        : crmSchemas[req.params.resource],
    )(req, res, next);

router.use(requireAuth);
router.use("/prescriptions", prescriptionsRoutes);
router.use("/leads", leadRoutes);
router.use("/patients", patientRoutes);
router.use("/referrals", referralRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/forms", formsRoutes);
router.param("resource", (req, res, next, resource) =>
  isCrmResource(resource)
    ? next()
    : res.status(404).json({ message: "CRM resource not found." }),
);
router.get("/lookups", canView, crmController.lookups);
router.get("/:resource", canView, crmController.list);
router.post("/:resource", canManage, validateResource(), crmController.create);
router.patch(
  "/:resource/:id",
  canManage,
  validateResource(true),
  crmController.update,
);
router.delete("/:resource/:id", canManage, crmController.delete);

export default router;
