import { createCrudService } from "../../../shared/services/crud.service.js";
import { teamModel } from "./teams.model.js";
export const teamService = createCrudService(teamModel);
