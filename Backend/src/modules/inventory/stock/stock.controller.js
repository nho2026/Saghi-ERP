import { inventoryAction } from "../shared/inventory.controller.js";
import { stockService } from "./stock.service.js";
export const stockController = {
  list: inventoryAction(stockService.list, 200),
  adjust: inventoryAction(stockService.adjust, 201),
};
