import { inventoryAction } from "../shared/inventory.controller.js";
import { transfersService } from "./transfers.service.js";
export const transfersController = {
  list: inventoryAction(transfersService.list),
  create: inventoryAction(transfersService.create, 201),
};
