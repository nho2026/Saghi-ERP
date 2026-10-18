import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { employeeService } from "./employees.service.js";
export const employeeController = createCrudController(employeeService);
