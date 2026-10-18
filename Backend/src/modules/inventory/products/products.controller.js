import { inventoryAction } from "../shared/inventory.controller.js";
import { productsService } from "./products.service.js";
export const productsController = {
  removeImage: inventoryAction(productsService.removeImage),
  updateExpiryDate: inventoryAction(productsService.updateExpiryDate),
  updateSpecialPrice: inventoryAction(productsService.updateSpecialPrice),
  updateSpecial: inventoryAction(productsService.updateSpecial),
  createSpecial: inventoryAction(productsService.createSpecial, 201),
  uploadImages: inventoryAction(productsService.uploadImages, 201),
  list: inventoryAction(productsService.list, 200),
  newBarcode: inventoryAction(productsService.newBarcode, 200),
  create: inventoryAction(productsService.create, 201),
  update: inventoryAction(productsService.update, 200),
  assignBarcode: inventoryAction(productsService.assignBarcode, 200),
  removeBarcode: inventoryAction(productsService.removeBarcode, 200),
  remove: inventoryAction(productsService.remove, 200),
};
