import { requireRequestPermission } from "../../../shared/middleware/permission.middleware.js";
import { Router } from "express";
import { patientController } from "./patient.controller.js";

const router = Router();

const canView = requireRequestPermission;

router.get("/", canView, patientController.list);
router.get("/:id", canView, patientController.profile);

export default router;
