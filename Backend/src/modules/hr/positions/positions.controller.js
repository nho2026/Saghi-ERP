import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { positionService } from "./positions.service.js";
export const positionController = createCrudController(positionService);
