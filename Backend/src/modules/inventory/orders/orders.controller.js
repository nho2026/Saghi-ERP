import { inventoryAction } from "../shared/inventory.controller.js";
import { ordersService } from "./orders.service.js";
export const ordersController = {
  arrival: inventoryAction(ordersService.arrival),
  remove: inventoryAction(ordersService.remove),
  update: inventoryAction(ordersService.update),
  create: inventoryAction(ordersService.create, 201),
  list: inventoryAction(ordersService.list),
};
