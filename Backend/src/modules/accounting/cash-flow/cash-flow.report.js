import { Prisma } from "@prisma/client";

// Aggregate exact decimal amounts without combining different currencies.
export function summarizeCashFlows(groups) {
  const totals = new Map(
    ["USD"].map((currency) => [
      currency,
      {
        currency,
        income: new Prisma.Decimal(0),
        expense: new Prisma.Decimal(0),
      },
    ]),
  );
  const breakdown = new Map();
  const departments = new Map();
  for (const row of groups) {
    const key = JSON.stringify([row.departmentId, row.category, row.currency]);
    if (!totals.has(row.currency))
      totals.set(row.currency, {
        currency: row.currency,
        income: new Prisma.Decimal(0),
        expense: new Prisma.Decimal(0),
      });
    if (!breakdown.has(key))
      breakdown.set(key, {
        departmentId: row.departmentId,
        category: row.category,
        currency: row.currency,
        income: new Prisma.Decimal(0),
        expense: new Prisma.Decimal(0),
      });
    const departmentKey = JSON.stringify([row.departmentId, row.currency]);
    if (!departments.has(departmentKey))
      departments.set(departmentKey, {
        departmentId: row.departmentId,
        currency: row.currency,
        income: new Prisma.Decimal(0),
        expense: new Prisma.Decimal(0),
      });
    const field = row.flowType === "inflow" ? "income" : "expense";
    for (const target of [
      totals.get(row.currency),
      breakdown.get(key),
      departments.get(departmentKey),
    ]) {
      target[field] = target[field].plus(row._sum.amount ?? 0);
    }
  }
  const serialize = (row) => ({
    ...row,
    income: row.income.toFixed(2),
    expense: row.expense.toFixed(2),
    net: row.income.minus(row.expense).toFixed(2),
  });
  return {
    departments: [...departments.values()].map(serialize),
    totals: [...totals.values()].map(serialize),
    breakdown: [...breakdown.values()].map(serialize),
  };
}
