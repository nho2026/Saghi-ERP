import { inventoryAction } from "../shared/inventory.controller.js";
import { retailersService } from "./retailers.service.js";
export const retailersController = {
  list: inventoryAction(retailersService.list),
  create: inventoryAction(retailersService.create, 201),
  update: inventoryAction(retailersService.update),
  remove: inventoryAction(retailersService.remove),
};
