import { createCrudService } from "../../../shared/services/crud.service.js";
import { positionModel } from "./positions.model.js";
export const positionService = createCrudService(positionModel);
