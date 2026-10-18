import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { payrollService } from "./payrolls.service.js";
export const payrollController = createCrudController(payrollService);
