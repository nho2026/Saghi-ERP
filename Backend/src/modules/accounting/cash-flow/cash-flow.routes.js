import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { cashFlowSchema as schema } from "./cash-flow.schema.js";
import { cashFlowService } from "./cash-flow.service.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { synchronizeFinance } from "./finance-sync.js";
import { mutateFlow, cashAccountSchema } from "./finance-management.js";
import { financeOverview } from "./finance-overview.js";
import { prisma } from "../../../shared/database/client.js";
import { paginateRows } from "../../../shared/database/paginate.js";
const router = Router(),
  manage = requirePermission("journal.create");
const run = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
router.use(async (req, _res, next) => {
  try {
    if (req.method === "GET") await synchronizeFinance();
    next();
  } catch (error) {
    next(error);
  }
});
router.get(
  "/report",
  run(async (req, res) => res.json(await cashFlowService.report(req.query))),
);
router.get(
  "/report/rows",
  run(async (req, res) => {
    const report = await cashFlowService.report(req.query);
    res.json(
      paginateRows(
        req.query.section === "departments"
          ? report.departments
          : report.breakdown,
        req.query,
      ),
    );
  }),
);
router.get(
  "/options",
  run(async (_req, res) =>
    res.json({
      ...(await cashFlowService.options()),
      cashAccounts: await prisma.financeCashAccount.findMany({
        orderBy: { name: "asc" },
      }),
    }),
  ),
);
router.get(
  "/overview",
  run(async (req, res) => res.json(await financeOverview(req.query))),
);
router.get(
  "/overview/rows",
  run(async (req, res) => {
    const report = await financeOverview(req.query);
    const rows =
      req.query.section === "debts"
        ? report.debts
        : report.months.flatMap((month) =>
            (req.query.section === "departments"
              ? month.departments
              : month.totals
            ).map((row) => ({ ...row, month: month.month })),
          );
    res.json(paginateRows(rows, req.query));
  }),
);
router.post(
  "/cash-accounts",
  manage,
  validate(cashAccountSchema),
  run(async (req, res) =>
    res
      .status(201)
      .json(
        await prisma.financeCashAccount.create({
          data: { ...req.validatedBody, createdBy: req.user.id },
        }),
      ),
  ),
);
router.get(
  "/:id/history",
  run(async (req, res) => {
    const history = await prisma.financeCashFlowAudit.findMany({
      where: { flowId: req.params.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const ids = [...new Set(history.map((row) => row.actorId).filter(Boolean))];
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    res.json(
      history.map((row) => ({
        ...row,
        actorName:
          users.find((user) => user.id === row.actorId)?.name ?? row.actorId,
      })),
    );
  }),
);
router.get(
  "/",
  run(async (req, res) => res.json(await cashFlowService.list(req.query))),
);
router.post(
  "/",
  manage,
  validate(schema),
  run(async (req, res) =>
    res
      .status(201)
      .json(await mutateFlow("create", null, req.validatedBody, req.user.id)),
  ),
);
router.patch(
  "/:id",
  manage,
  validate(schema.partial()),
  run(async (req, res) =>
    res.json(
      await mutateFlow("update", req.params.id, req.validatedBody, req.user.id),
    ),
  ),
);
router.post(
  "/:id/approve",
  (req, res, next) => {
    if (
      !req.permissionKeys?.has("*") &&
      !req.permissionKeys?.has("finance.cash-flow.approve")
    )
      return res
        .status(403)
        .json({ message: "Expense approval permission is required." });
    next();
  },
  run(async (req, res) =>
    res.json(await mutateFlow("approve", req.params.id, {}, req.user.id)),
  ),
);
router.delete(
  "/:id",
  manage,
  run(async (req, res) => {
    await mutateFlow("cancel", req.params.id, {}, req.user.id);
    res.status(204).end();
  }),
);
export default router;
