import { inventoryAction } from "../shared/inventory.controller.js";
import { brandsService } from "./brands.service.js";
export const brandsController = {
  list: inventoryAction(brandsService.list, 200),
  create: inventoryAction(brandsService.create, 201),
  update: inventoryAction(brandsService.update, 200),
  remove: inventoryAction(brandsService.remove, 200),
};
