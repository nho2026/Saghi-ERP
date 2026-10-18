import { inventoryAction } from "../shared/inventory.controller.js";
import { patientProductsService } from "./patient-products.service.js";
export const patientProductsController = {
  list: inventoryAction(patientProductsService.list),
};
