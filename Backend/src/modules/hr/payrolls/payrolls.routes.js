import { prisma } from "../../../shared/database/client.js";
import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { payrollController } from "./payrolls.controller.js";
import { payrollSchema } from "./payrolls.schema.js";
import { monthlyReport } from "../reports/monthly-report.js";
const router = Router();
const view = requirePermission("employees.view"),
  process = requirePermission("payroll.process");
router.get(
  "/monthly-report",
  view,
  requirePermission("hr.employees.view"),
  requirePermission("hr.salaries.view"),
  requirePermission("hr.payroll-adjustments.view"),
  requirePermission("hr.attendance-permissions.view"),
  async (req, res, next) => {
    try {
      res.json(await monthlyReport(req.query, true));
    } catch (error) {
      next(error);
    }
  },
);
router.get("/attendance-events", view, async (req, res, next) => {
  try {
    const month = String(req.query.month ?? "");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      return res
        .status(400)
        .json({ message: "A valid payroll month is required." });
    const [year, number] = month.split("-").map(Number);
    const from = new Date(`${month}-01T00:00:00+03:00`);
    const to = new Date(Date.UTC(year, number, 1) - 3 * 3600000);
    res.json(
      await prisma.attendanceEvent.findMany({
        where: { occurredAt: { gte: from, lt: to } },
        select: {
          id: true,
          employeeNo: true,
          eventType: true,
          occurredAt: true,
          person: { select: { id: true, employeeId: true } },
          device: { select: { name: true } },
        },
        orderBy: { occurredAt: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.get("/", view, payrollController.list);
router.post("/", process, validate(payrollSchema), payrollController.create);
router.patch(
  "/:id",
  process,
  validate(payrollSchema.partial()),
  payrollController.update,
);
router.delete("/:id", process, payrollController.remove);
export default router;
