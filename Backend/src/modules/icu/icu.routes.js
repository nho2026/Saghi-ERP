import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../shared/middleware/permission.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { icuController as controller } from "./icu.controller.js";
import { itemReductionSchema, operationTypeSchema } from "./icu.schema.js";

const router = Router();
router.use(requireAuth);

const view = requirePermission("inventory.icu.view");
const create = requirePermission("inventory.icu.create");
const update = requirePermission("inventory.icu.update");

router.get("/dashboard", view, controller.dashboard);
router.get("/cases", view, controller.cases);
router.get("/staff", view, controller.staff);
router.get("/operation-types", view, controller.operationTypes);
router.post(
  "/operation-types",
  create,
  validate(operationTypeSchema),
  controller.createOperationType,
);
router.patch(
  "/operation-types/:id",
  update,
  validate(operationTypeSchema.partial()),
  controller.updateOperationType,
);
router.get("/storage", view, controller.storage);
router.get("/products", view, controller.products);
router.get("/item-reductions", view, controller.itemReductions);
router.post(
  "/item-reductions",
  create,
  validate(itemReductionSchema),
  controller.createItemReduction,
);

export default router;
