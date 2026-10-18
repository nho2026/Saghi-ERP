import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { upload } from "../inventory/products/products.upload.js";
import { buildingController } from "./building.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", buildingController.overview);
router.post(
  "/invoices",
  upload.single("invoice"),
  buildingController.uploadInvoice,
);
router.post("/products", buildingController.createProduct);
router.put("/products/:id", buildingController.updateProduct);
router.put("/allocations/:id", buildingController.updateAllocation);
router.post("/expenses", buildingController.createExpense);
router.put("/expenses/:id", buildingController.updateExpense);
router.post("/requests", buildingController.createRequest);
router.put("/requests/:id/payment", buildingController.recordPayment);
router.put("/requests/:id", buildingController.updateDraft);
router.put("/requests/:id/submit", buildingController.submitRequest);
router.patch("/requests/:id/status", buildingController.updateRequestStatus);

export default router;
