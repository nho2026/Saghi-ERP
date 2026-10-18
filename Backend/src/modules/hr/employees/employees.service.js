import { createCrudService } from "../../../shared/services/crud.service.js";
import { employeeModel } from "./employees.model.js";
export const employeeService = createCrudService(employeeModel);
