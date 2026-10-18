import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { teamService } from "./teams.service.js";
export const teamController = createCrudController(teamService);
