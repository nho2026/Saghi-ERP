import { useBuildingTranslation } from "./useBuildingTranslation";
import { buildingFinancials, orderDebt } from "./building-financials";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  Building2,
  WalletCards,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { apiClient } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { buildingNavigation } from "./building-navigation";
import { BuildingStatusBadge } from "./BuildingStatusBadge";
import type { BuildingData } from "./BuildingExpensesPage";

const total = (items: BuildingData["requests"][number]["items"]) =>
  items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  ) / 100;
export default function BuildingDashboardPage() {
  const { t, i18n } = useBuildingTranslation();
  const locale = i18n.language.startsWith("ku") ? "ckb-IQ" : i18n.language;
  const money = (value: number | string) =>
    Number(value).toLocaleString(locale, { maximumFractionDigits: 2 });
  const [search, setSearch] = useState("");
  const { data, error, isLoading, refresh } = useApiResource(
    useCallback(
      async () =>
        (await apiClient.get<BuildingData>("/building-expenses")).data,
      [],
    ),
  );
  const requests = data?.requests ?? [];
  const expenses = data?.expenses ?? [];
  const financials = buildingFinancials(expenses, requests);
  const expenseTotal = financials.operatingExpenses;
  const debts = requests
    .filter((row) => row.status === "completed" && orderDebt(row) > 0)
    .sort((a, b) => orderDebt(b) - orderDebt(a));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      date,
      amount: expenses
        .filter((row) => row.date.slice(0, 10) === key)
        .reduce((sum, row) => sum + Number(row.amount), 0),
    };
  });
  const max = Math.max(1, ...days.map((day) => day.amount));
  const value = (number: number) => (isLoading || !data ? "—" : money(number));
  const departments =
    data?.departments.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  const stats = [
    {
      label: "Total expenses",
      amount: financials.totalExpenses,
      note: "Daily expenses + completed purchases",
      path: "expenses",
      green: true,
    },
    {
      label: "Total paid",
      amount: financials.totalPaid,
      note: "Daily expenses paid + purchase payments",
      path: "purchases",
    },
    {
      label: "Debt we owe",
      amount: financials.purchaseDebt,
      note: "Unpaid balance on completed purchases",
      path: "purchases",
    },
    {
      label: "Money owed to us",
      amount: financials.salesReceivable,
      note: "Unpaid balance on completed department sales",
      path: "sales",
    },
  ];
  return (
    <div className="min-w-0 flex-1 bg-muted/30 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute inset-s-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search departments")}
              aria-label={t("Search departments")}
              className="rounded-full border-0 bg-muted/40 ps-9"
            />
          </div>
          <Badge variant="outline" className="gap-2 rounded-full px-3 py-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            {t("All-time financial overview")}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("Dashboard")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "Total expenses, payments and outstanding debt across your building.",
              )}
            </p>
          </div>
        </div>
        {error && (
          <Card className="flex items-center justify-between gap-3 p-4 text-destructive">
            <p role="alert">{t(error)}</p>
            <Button variant="outline" onClick={() => void refresh()}>
              {t("Retry")}
            </Button>
          </Card>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={t(stat.label)}
              className={`rounded-2xl border-0 p-5 shadow-none ${stat.green ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : "bg-card"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">{t(stat.label)}</h2>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={`size-7 rounded-full border ${stat.green ? "border-white/30 hover:bg-white/10 hover:text-white" : "border-border"}`}
                >
                  <Link
                    to={`/building-expenses/${stat.path}`}
                    aria-label={t("View {{label}}", { label: t(stat.label) })}
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-4xl font-medium tracking-tight tabular-nums">
                {value(stat.amount)}
              </p>
              <p
                className={`mt-3 text-xs ${stat.green ? "text-emerald-200" : "text-muted-foreground"}`}
              >
                {t(stat.note)}
              </p>
            </Card>
          ))}
        </div>
        <Card className="overflow-hidden rounded-2xl border-0 shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="font-semibold">{t("Outstanding debt")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Purchase debt and unpaid sales are shown separately for each completed order.",
                )}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {isLoading || !data
                ? "?"
                : t("{{count}} unpaid orders", { count: debts.length })}
            </Badge>
          </div>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>{t("Department / reference")}</TableHead>
                <TableHead>{t("Debt type")}</TableHead>
                <TableHead className="text-end">{t("Total")}</TableHead>
                <TableHead className="text-end">{t("Paid")}</TableHead>
                <TableHead className="text-end">{t("Remaining")}</TableHead>
                <TableHead className="text-end">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={debts.length > 0}>
              {debts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-4">
                    <p className="font-medium">{row.department?.name ?? t("Unassigned department")}</p>
                    <p className="text-xs text-muted-foreground" title={row.id}>
                      #{row.id.slice(-8).toUpperCase()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.kind === "purchase"
                          ? "border-0 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                          : "border-0 bg-blue-500/10 text-blue-800 dark:text-blue-300"
                      }
                    >
                      {row.kind === "purchase" ? t("We owe") : t("Owed to us")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {money(total(row.items))}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {money(Number(row.paidAmount))}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {money(orderDebt(row))}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/building-expenses/${row.kind === "purchase" ? "purchases" : "sales"}?search=${encodeURIComponent(row.id)}`}
                      >
                        {t("View order")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!debts.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    {isLoading
                      ? t("Loading balances?")
                      : error
                        ? t("Unable to load balances")
                        : t("No outstanding debt on completed orders")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
        <div className="grid gap-4 xl:grid-cols-12">
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:col-span-9">
            <Card className="rounded-2xl border-0 p-5 shadow-none">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t("Expense analytics")}</h2>
                <span className="text-xs text-muted-foreground">
                  {t("Last 7 days")}
                </span>
              </div>
              <div
                className="mt-6 flex h-36 items-end justify-between gap-3"
                role="img"
                aria-label={
                  isLoading
                    ? t("Loading expense analytics")
                    : days
                        .map(
                          (day) =>
                            `${day.date.toLocaleDateString(locale)}: ${money(day.amount)}`,
                        )
                        .join(", ")
                }
              >
                {days.map(({ date, amount }, index) => (
                  <div
                    key={index}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span
                      className="max-w-full truncate text-xs text-muted-foreground"
                      title={value(amount)}
                    >
                      {value(amount)}
                    </span>
                    <div
                      className={`w-full max-w-12 rounded-full ${amount ? (index === 6 ? "bg-emerald-950 dark:bg-emerald-300" : "bg-emerald-600/80") : "bg-muted"}`}
                      style={{
                        height: `${isLoading ? 16 : Math.max(8, (amount / max) * 90)}px`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {date.toLocaleDateString(locale, { weekday: "short" })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("Recorded expenses per day")}
              </p>
            </Card>
            <Card className="rounded-2xl border-0 p-5 shadow-none">
              <h2 className="font-semibold">
                {t("Expense & payment summary")}
              </h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t("Daily, cleaning, drinks & other expenses")}
                  </span>
                  <strong className="tabular-nums">
                    {value(financials.operatingExpenses)}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t("Completed purchases")}
                  </span>
                  <strong className="tabular-nums">
                    {value(financials.purchases)}
                  </strong>
                </div>
                <div className="flex justify-between gap-3 border-t pt-4 text-base">
                  <span className="font-semibold">{t("Total expenses")}</span>
                  <strong className="tabular-nums">
                    {value(financials.totalExpenses)}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t("Already paid")}
                  </span>
                  <strong className="text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {value(financials.totalPaid)}
                  </strong>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-amber-500/10 p-3">
                  <span>{t("Remaining purchase debt")}</span>
                  <strong className="tabular-nums text-amber-800 dark:text-amber-300">
                    {value(financials.purchaseDebt)}
                  </strong>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {t(
                  "Daily expense entries are treated as paid. Drafts, pending orders and sales are excluded from total expenses.",
                )}
              </p>
            </Card>
            <Card className="min-w-0 rounded-2xl border-0 p-5 shadow-none">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{t("Recent orders")}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/building-expenses/requests">
                    {t("View requests")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {requests.slice(0, 5).map((row) => (
                  <Link
                    key={row.id}
                    to={`/building-expenses/${row.kind === "sale" ? "sales" : "purchases"}`}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <Building2 className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {row.department?.name ?? t("Unassigned department")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.items[0]?.name} · {money(total(row.items))}
                      </p>
                    </div>
                    <BuildingStatusBadge status={row.status} />
                  </Link>
                ))}
                {!requests.length && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    {isLoading
                      ? t("Loading orders…")
                      : error
                        ? t("Order data unavailable")
                        : t("No orders yet. Create a draft from Requests.")}
                  </p>
                )}
              </div>
            </Card>
            <Card className="rounded-2xl border-0 p-5 shadow-none">
              <h2 className="mb-5 font-semibold">{t("Expense breakdown")}</h2>
              <div className="space-y-4">
                {["daily", "cleaning", "drinks", "maintenance", "other"].map(
                  (category) => {
                    const amount = expenses
                      .filter((row) => row.category === category)
                      .reduce((sum, row) => sum + Number(row.amount), 0);
                    return (
                      <div key={t(category)}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="capitalize">{t(category)}</span>
                          <span className="font-medium tabular-nums">
                            {value(amount)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{
                              width: `${expenseTotal ? (amount / expenseTotal) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>
          </div>
          <div className="flex min-w-0 flex-col gap-4 xl:col-span-3">
            <Card className="flex-1 rounded-2xl border-0 p-5 shadow-none">
              <h2 className="mb-5 font-semibold">{t("Departments")}</h2>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {departments.map((department) => (
                  <Link
                    key={department.id}
                    to={`/building-expenses/departments?department=${encodeURIComponent(department.id)}`}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                  >
                    <Building2 className="size-5 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {department.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("{{count}} assigned products", {
                          count:
                            data?.allocations.filter(
                              (row) => row.departmentId === department.id,
                            ).length ?? 0,
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
                {!departments.length && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {isLoading
                      ? t("Loading departments…")
                      : error
                        ? t("Department data unavailable")
                        : search
                          ? t("No matching departments")
                          : t("No departments yet")}
                  </p>
                )}
              </div>
            </Card>
            <Card className="relative overflow-hidden rounded-2xl border-0 bg-emerald-950 p-6 text-white shadow-none">
              <div className="pointer-events-none absolute -end-16 -top-12 size-56 rounded-full border-[24px] border-emerald-800/40" />
              <h2 className="relative flex items-center gap-2 text-sm">
                <WalletCards className="size-4" />
                {t("Sales payments collected")}
              </h2>
              <p className="relative my-5 text-3xl font-medium tabular-nums">
                {value(financials.salesCollected)}
              </p>
              <p className="relative text-xs text-emerald-200">
                {t("Payments received on completed department sales")}
              </p>
            </Card>
            <Card className="rounded-2xl border-0 p-4 shadow-none">
              <h2 className="mb-2 px-2 font-semibold">{t("Quick access")}</h2>
              {buildingNavigation.slice(1).map(({ to, label, icon: Icon }) => (
                <Button
                  key={to}
                  asChild
                  variant="ghost"
                  className="w-full justify-start gap-3"
                >
                  <Link to={to}>
                    <Icon className="size-4 text-emerald-600" />
                    {t(label)}
                  </Link>
                </Button>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
