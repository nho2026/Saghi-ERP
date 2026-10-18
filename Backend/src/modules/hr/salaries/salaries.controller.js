import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { salaryService } from "./salaries.service.js";
export const salaryController = createCrudController(salaryService);
