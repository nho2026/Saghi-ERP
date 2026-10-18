import { Router } from "express";
import { manage } from "../shared/inventory.permissions.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { createDirectoryController } from "./directories.controller.js";
import { directoryDefinitions } from "./directories.schema.js";
const router = Router();
for (const definition of directoryDefinitions) {
  const { path } = definition;
  const controller = createDirectoryController(definition);
  router.get(`/${path}`, requirePermission("inventory.view"), controller.list);
  router.post(`/${path}`, manage, controller.create);
  router.patch(`/${path}/:id`, manage, controller.update);
  router.delete(`/${path}/:id`, manage, controller.remove);
}
export default router;
