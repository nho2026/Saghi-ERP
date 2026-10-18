import { inventoryAction } from "../shared/inventory.controller.js";
import { movementsService } from "./movements.service.js";
export const movementsController = {
  list: inventoryAction(movementsService.list, 200),
};
