import { inventoryAction } from "../shared/inventory.controller.js";
import { createDirectoryService } from "./directories.service.js";
export function createDirectoryController(definition) {
  const service = createDirectoryService(definition);
  return {
    list: inventoryAction(service.list),
    create: inventoryAction(service.create, 201),
    update: inventoryAction(service.update),
    remove: inventoryAction(service.remove),
  };
}
