import { inventoryAction } from "../shared/inventory.controller.js";
import { purchasesService } from "./purchases.service.js";
export const purchasesController = {
  debts: inventoryAction(purchasesService.debts, 200),
  pay: inventoryAction(purchasesService.pay, 201),
  list: inventoryAction(purchasesService.list, 200),
  returnPurchase: async (req, res, next) => {
    try {
      res.json(
        await purchasesService.returnPurchase({
          id: req.params.id,
          body: req.body,
          passwordHash: req.user?.passwordHash,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      res.json(
        await purchasesService.remove({
          id: req.params.id,
          body: req.body,
          passwordHash: req.user?.passwordHash,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
  retailers: inventoryAction(purchasesService.retailers, 200),
  update: inventoryAction(purchasesService.update, 200),
  create: inventoryAction(purchasesService.create, 201),
};
