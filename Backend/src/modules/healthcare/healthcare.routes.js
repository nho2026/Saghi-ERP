import { paginate } from "../../shared/database/paginate.js";
import { z } from "zod";
import { prisma } from "../../shared/database/client.js";
import { createCrudController } from "../../shared/controllers/crud.controller.js";
const specializations = createCrudController({
  list: (query) =>
    paginate("doctorSpecialization", query, { orderBy: { name: "asc" } }, [
      "name",
    ]),
  create: (data) => prisma.doctorSpecialization.create({ data }),
  update: (id, data) =>
    prisma.doctorSpecialization.update({ where: { id }, data }),
  remove: (id) => prisma.doctorSpecialization.delete({ where: { id } }),
});
const specializationSchema = z.object({
  name: z.string().trim().min(1).max(191),
});
import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../../shared/middleware/permission.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { healthcareController as c } from "./healthcare.controller.js";
import {
  departmentIdsSchema,
  departmentSchema,
  staffSchema,
} from "./healthcare.schema.js";
const router = Router();
router.use(requireAuth);
const view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/specializations", view, specializations.list);
router.post(
  "/specializations",
  manage,
  validate(specializationSchema),
  specializations.create,
);
router.patch(
  "/specializations/:id",
  manage,
  validate(specializationSchema),
  specializations.update,
);
router.delete("/specializations/:id", manage, specializations.remove);
router.get(
  "/departments",
  requireAnyPermission("employees.view", "users.create", "users.update"),
  c.departments,
);
router.post(
  "/departments",
  manage,
  validate(departmentSchema),
  c.createDepartment,
);
router.patch(
  "/departments/:id",
  manage,
  validate(departmentSchema.partial()),
  c.updateDepartment,
);
router.delete(
  "/departments/bulk",
  manage,
  validate(departmentIdsSchema),
  c.removeDepartments,
);
router.delete("/departments/:id", manage, c.removeDepartment);
router.get("/staff", view, c.staff);
router.post("/staff", manage, validate(staffSchema), c.createStaff);
router.patch(
  "/staff/:id",
  manage,
  validate(staffSchema.partial()),
  c.updateStaff,
);
router.delete("/staff/:id", manage, c.removeStaff);
export default router;
