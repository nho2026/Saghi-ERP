import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { attendanceService } from "./attendance.service.js";
export const attendanceController = createCrudController(attendanceService);
