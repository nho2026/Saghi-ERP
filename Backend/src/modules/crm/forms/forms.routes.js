import { requireRequestPermission } from "../../../shared/middleware/permission.middleware.js";
import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { formsController } from "./forms.controller.js";
import { formSubmissionSchema, formTemplateSchema } from "./forms.schema.js";

const router = Router();
const canView = requireRequestPermission;
const canManage = requireRequestPermission;

router.get("/", canView, formsController.templates);
router.get("/active", canView, formsController.activeTemplates);
router.post(
  "/",
  canManage,
  validate(formTemplateSchema),
  formsController.createTemplate,
);
router.patch(
  "/:id",
  canManage,
  validate(formTemplateSchema.partial()),
  formsController.updateTemplate,
);
router.delete("/:id", canManage, formsController.removeTemplate);
router.get("/patient/:patientId", canView, formsController.submissions);
router.post(
  "/patient/:patientId",
  canManage,
  validate(formSubmissionSchema),
  formsController.createSubmission,
);
router.delete("/submissions/:id", canManage, formsController.removeSubmission);

export default router;
