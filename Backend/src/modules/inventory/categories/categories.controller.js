import { inventoryAction } from "../shared/inventory.controller.js";
import { categoriesService } from "./categories.service.js";
export const categoriesController = {
  list: inventoryAction(categoriesService.list, 200),
  create: inventoryAction(categoriesService.create, 201),
  update: inventoryAction(categoriesService.update, 200),
  remove: inventoryAction(categoriesService.remove, 200),
};
