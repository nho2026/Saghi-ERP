import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../shared/database/client.js";

export const snapshot = (row) => JSON.parse(JSON.stringify(row));
export async function audit(tx, flowId, action, actorId, before, after) {
  await tx.financeCashFlowAudit.create({
    data: {
      flowId,
      action,
      actorId: actorId ?? null,
      ...(before ? { before: snapshot(before) } : {}),
      ...(after ? { after: snapshot(after) } : {}),
    },
  });
}
const decimal = (v) => new Prisma.Decimal(v ?? 0);
export function sourceEntries(source, currency) {
  const entries = [];
  const add = (
    type,
    id,
    amount,
    date,
    flowType,
    category,
    sourceUrl,
    departmentId = null,
    unit = currency,
  ) => {
    if (decimal(amount).lte(0)) return;
    entries.push({
      sourceType: type,
      sourceId: id,
      amount: decimal(amount).toFixed(2),
      flowDate: date,
      flowType,
      category,
      sourceUrl,
      departmentId,
      currency: unit,
      description: `${category} · ${id}`.slice(0, 191),
      status: "confirmed",
    });
  };
  for (const p of source.patients)
    if (p.status === "paid")
      add(
        "patient_payment",
        p.id,
        p.amount,
        p.paidAt,
        "inflow",
        "Patient payments",
        "/crm/payments",
        p.surgeryAppointment?.doctor?.departmentId,
      );
  for (const p of source.billing)
    if (!["draft", "cancelled"].includes(p.invoice.status))
      add(
        "billing_payment",
        p.id,
        p.amount,
        p.paidAt,
        "inflow",
        "Customer payments",
        "/accounting/payments",
        null,
        p.invoice.currency,
      );
  for (const p of source.purchases) {
    if (p.status !== "completed") continue;
    // Cash purchases have no payment rows. Debt payments are separate receipts.
    if (!p.isDebt)
      add(
        "purchase",
        p.id,
        p.totalPrice,
        p.buyDate,
        "outflow",
        "Supplies",
        "/warehouses/buy/product",
      );
    else {
      const recorded = p.payments.reduce(
        (sum, row) => sum.plus(row.amount),
        decimal(0),
      );
      const openingPaid = decimal(p.paidAmount).minus(recorded);
      add(
        "purchase",
        p.id,
        openingPaid,
        p.buyDate,
        "outflow",
        "Supplies",
        "/warehouses/buy/debts",
      );
      for (const payment of p.payments)
        add(
          "purchase_payment",
          payment.id,
          payment.amount,
          payment.paidAt,
          "outflow",
          "Supplies",
          "/warehouses/buy/debts",
        );
    }
  }
  for (const p of source.payrolls)
    if (p.status === "paid")
      add(
        "payroll",
        p.id,
        p.netSalary,
        p.paidAt ?? new Date(Date.UTC(p.year, p.month - 1, 1)),
        "outflow",
        "Salaries",
        "/payrolls",
        p.employee.departmentId,
        p.salary?.currencyId || currency,
      );
  for (const p of source.sales)
    if (p.status === "completed")
      add(
        "pos_sale",
        p.id,
        decimal(p.paidAmount).minus(p.changeAmount),
        p.soldAt,
        "inflow",
        "Product sales",
        "/pos/sales",
      );
  return entries;
}

// Serialize reconciliation across requests/processes. Only changed source records
// produce writes/audits; source keys enforce idempotency at the database level.
async function reconcileFinance() {
  return prisma.$transaction(
    async (tx) => {
      await tx.systemSetting.upsert({
        where: { category: "finance-ledger-sync" },
        create: { category: "finance-ledger-sync", value: {} },
        update: {},
      });
      await tx.$queryRaw`SELECT category FROM system_Settings WHERE category = 'finance-ledger-sync' FOR UPDATE`;
      const setting = await tx.systemSetting.findUnique({
        where: { category: "finance" },
      });
      const currency = setting?.value?.currency ?? "USD";
      const [patients, billing, purchases, payrolls, sales, existing] =
        await Promise.all([
          tx.patientPayment.findMany({
            include: { surgeryAppointment: { include: { doctor: true } } },
          }),
          tx.billingPayment.findMany({ include: { invoice: true } }),
          tx.inventoryPurchase.findMany({ include: { payments: true } }),
          tx.payroll.findMany({ include: { employee: true, salary: true } }),
          tx.posSale.findMany(),
          tx.financeCashFlow.findMany({ where: { sourceType: { not: null } } }),
        ]);
      const previous = new Map(
        existing.map((row) => [`${row.sourceType}:${row.sourceId}`, row]),
      );
      const seen = new Set();
      for (const entry of sourceEntries(
        { patients, billing, purchases, payrolls, sales },
        currency,
      )) {
        const key = `${entry.sourceType}:${entry.sourceId}`;
        seen.add(key);
        const old = previous.get(key);
        // Keep currency and classification snapshots once imported. Source modules
        // without currency fields must not change denomination with system settings.
        if (old) {
          entry.currency = old.currency;
          entry.departmentId = old.departmentId;
          entry.category = old.category;
        }
        const sourceHash = createHash("sha256")
          .update(JSON.stringify(entry))
          .digest("hex");
        if (old?.sourceHash === sourceHash && old.status === "confirmed")
          continue;
        const row = old
          ? await tx.financeCashFlow.update({
              where: { id: old.id },
              data: { ...entry, sourceHash },
            })
          : await tx.financeCashFlow.create({ data: { ...entry, sourceHash } });
        await audit(
          tx,
          row.id,
          old ? "source_updated" : "source_imported",
          null,
          old,
          row,
        );
      }
      for (const old of existing)
        if (
          !seen.has(`${old.sourceType}:${old.sourceId}`) &&
          old.status !== "cancelled"
        ) {
          const row = await tx.financeCashFlow.update({
            where: { id: old.id },
            data: { status: "cancelled" },
          });
          await audit(tx, row.id, "source_cancelled", null, old, row);
        }
    },
    { timeout: 60000, isolationLevel: "ReadCommitted" },
  );
}

let inFlight;
export function synchronizeFinance() {
  if (!inFlight)
    inFlight = reconcileFinance().finally(() => {
      inFlight = undefined;
    });
  return inFlight;
}
