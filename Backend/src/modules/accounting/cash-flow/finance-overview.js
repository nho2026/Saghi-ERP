import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { summarizeCashFlows } from "./cash-flow.report.js";
const D = (value) => new Prisma.Decimal(value ?? 0);
export async function financeOverview(query) {
  const year = z.coerce
    .number()
    .int()
    .min(2000)
    .max(2200)
    .parse(query.year ?? new Date().getFullYear());
  const [
    accounts,
    balances,
    flows,
    invoices,
    purchases,
    setting,
    unassigned,
    pending,
  ] = await prisma.$transaction([
    prisma.financeCashAccount.findMany({ orderBy: { name: "asc" } }),
    prisma.financeCashFlow.groupBy({
      by: ["cashAccountId", "currency", "flowType"],
      where: { status: "confirmed" },
      _sum: { amount: true },
    }),
    prisma.financeCashFlow.findMany({
      where: {
        status: "confirmed",
        flowDate: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
      select: {
        departmentId: true,
        category: true,
        currency: true,
        flowType: true,
        amount: true,
        flowDate: true,
      },
    }),
    prisma.billingInvoice.findMany({
      where: {
        status: { notIn: ["draft", "cancelled", "paid"] },
        balanceAmount: { gt: 0 },
      },
      select: {
        id: true,
        invoiceNumber: true,
        currency: true,
        balanceAmount: true,
        dueDate: true,
        customer: { select: { name: true } },
      },
    }),
    prisma.inventoryPurchase.findMany({
      where: { status: "completed", isDebt: true },
      select: {
        id: true,
        invoiceNumber: true,
        retailer: true,
        totalPrice: true,
        paidAmount: true,
      },
    }),
    prisma.systemSetting.findUnique({ where: { category: "finance" } }),
    prisma.financeCashFlow.count({
      where: { status: "confirmed", departmentId: null },
    }),
    prisma.financeCashFlow.count({ where: { status: "pending" } }),
  ]);
  const balanceFor = (id, currency) =>
    balances
      .filter((row) => row.cashAccountId === id && row.currency === currency)
      .reduce(
        (sum, row) =>
          row.flowType === "inflow"
            ? sum.plus(row._sum.amount ?? 0)
            : sum.minus(row._sum.amount ?? 0),
        D(0),
      );
  const currencies = [
    ...new Set([
      "USD",
      ...balances.map((row) => row.currency),
      ...invoices.map((row) => row.currency),
      setting?.value?.currency ?? "USD",
    ]),
  ];
  const debts = [
    ...invoices.map((row) => ({
      id: row.id,
      type: "receivable",
      name: row.customer.name,
      reference: row.invoiceNumber,
      currency: row.currency,
      amount: D(row.balanceAmount).toFixed(2),
      dueDate: row.dueDate,
      url: "/accounting/invoices",
    })),
    ...purchases
      .filter((row) => D(row.totalPrice).gt(row.paidAmount))
      .map((row) => ({
        id: row.id,
        type: "payable",
        name: row.retailer,
        reference: row.invoiceNumber,
        currency: setting?.value?.currency ?? "USD",
        amount: D(row.totalPrice).minus(row.paidAmount).toFixed(2),
        dueDate: null,
        url: "/warehouses/buy/debts",
      })),
  ];
  return {
    year,
    pending,
    unassigned,
    accounts: accounts.map((account) => ({
      ...account,
      balance: D(account.openingBalance)
        .plus(balanceFor(account.id, account.currency))
        .toFixed(2),
    })),
    unallocated: currencies.map((currency) => ({
      currency,
      net: balanceFor(null, currency).toFixed(2),
    })),
    debts,
    debtTotals: currencies.map((currency) => ({
      currency,
      receivable: debts
        .filter((r) => r.currency === currency && r.type === "receivable")
        .reduce((sum, r) => sum.plus(r.amount), D(0))
        .toFixed(2),
      payable: debts
        .filter((r) => r.currency === currency && r.type === "payable")
        .reduce((sum, r) => sum.plus(r.amount), D(0))
        .toFixed(2),
    })),
    months: Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      ...summarizeCashFlows(
        flows
          .filter((row) => row.flowDate.getUTCMonth() === month)
          .map((row) => ({ ...row, _sum: { amount: row.amount } })),
      ),
    })),
  };
}
