import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { payrollAdjustmentService } from "./payroll-adjustments.service.js";

export const payrollAdjustmentController = createCrudController(
  payrollAdjustmentService,
);
