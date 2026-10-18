import { createCrudController } from "../../../shared/controllers/crud.controller.js";
import { cashFlowService } from "./cash-flow.service.js";
export const cashFlowController = createCrudController(cashFlowService);
