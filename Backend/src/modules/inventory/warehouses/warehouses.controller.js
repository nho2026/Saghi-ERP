import { inventoryAction } from "../shared/inventory.controller.js";
import { warehousesService } from "./warehouses.service.js";
export const warehousesController = {
  list: inventoryAction(warehousesService.list, 200),
  create: inventoryAction(warehousesService.create, 201),
  update: inventoryAction(warehousesService.update, 200),
  remove: inventoryAction(warehousesService.remove, 200),
};
