import { Router } from "express";
import {
  requireAnyPermission,
  requirePermission,
} from "../../../shared/middleware/permission.middleware.js";
import { prescriptionsController as controller } from "./prescriptions.controller.js";
const router = Router();
router.get(
  "/catalog",
  requireAnyPermission("employees.view", "employees.manage"),
  controller.catalog,
);
router.get(
  "/patient/:patientId",
  requireAnyPermission("employees.view", "employees.manage"),
  controller.list,
);
router.post(
  "/patient/:patientId",
  requirePermission("employees.manage"),
  controller.create,
);
export default router;
