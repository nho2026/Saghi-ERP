import { createCrudService } from "../../../shared/services/crud.service.js";
import { attendanceModel } from "./attendance.model.js";
export const attendanceService = createCrudService(attendanceModel);
