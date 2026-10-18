import {
  requireAnyPermission,
  requirePermission,
} from "../../../shared/middleware/permission.middleware.js";
export const view = requirePermission("inventory.view");
export const manage = requirePermission("inventory.manage");
export const adjust = requirePermission("inventory.adjust");
export const viewForPos = requireAnyPermission("inventory.view", "pos.use");
