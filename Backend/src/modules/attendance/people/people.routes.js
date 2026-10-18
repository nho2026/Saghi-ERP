import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { peopleController as c } from "./people.controller.js";
import {
  personSchema,
  updatePersonSchema,
  syncPeopleSchema,
  credentialSchema,
  deletePersonSchema,
} from "./people.schema.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
const router = Router(),
  view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, c.list);
router.post("/sync", manage, validate(syncPeopleSchema), c.sync);
router.post("/", manage, validate(personSchema), c.create);
router.patch("/:id", manage, validate(updatePersonSchema), c.update);
router.delete("/:id", manage, validate(deletePersonSchema), c.remove);
router.delete("/:id/:method", manage, c.removeCredential);
router.post(
  "/:id/:method",
  manage,
  validate(credentialSchema),
  c.addCredential,
);
export default router;
