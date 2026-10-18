import { Router } from "express";
import { manage, viewForPos } from "../shared/inventory.permissions.js";
import { productsController } from "./products.controller.js";
import { upload } from "./products.upload.js";
const router = Router();
router.patch(
  "/products/:id/expiry-date",
  manage,
  productsController.updateExpiryDate,
);
router.patch(
  "/products/:id/special-price",
  manage,
  productsController.updateSpecialPrice,
);
router.patch("/products/special/:id", manage, productsController.updateSpecial);
router.post("/products/special", manage, productsController.createSpecial);
router.post(
  "/products/images",
  manage,
  upload.array("images", 8),
  productsController.uploadImages,
);
router.delete("/products/images", manage, productsController.removeImage);
router.get("/products", viewForPos, productsController.list);
router.get("/products/barcode/new", manage, productsController.newBarcode);
router.post("/products", manage, productsController.create);
router.patch("/products/:id", manage, productsController.update);
router.patch("/products/:id/barcode", manage, productsController.assignBarcode);
router.delete(
  "/products/:id/barcode",
  manage,
  productsController.removeBarcode,
);
router.delete("/products/:id", manage, productsController.remove);
export default router;
