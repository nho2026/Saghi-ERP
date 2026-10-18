import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  WalletCards,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { permissionForPath } from "@/features/auth/permission-policy";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { FinanceBarChart } from "../components/FinanceBarChart";
import type { Overview } from "./FinanceOverview";

export default function AccountantDashboardPage() {
  const { t } = useTranslation();
  const user = storedUser();
  const [year, setYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState("USD");
  const [search, setSearch] = useState("");
  const data = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<Overview>("/finance/cash-flow/overview", { params: { year } })
          .then((r) => r.data),
      [year],
    ),
  );
  const overview = data.data;
  const currencies = [
    ...new Set([
      "USD",
      ...(overview?.months.flatMap((m) => m.totals.map((r) => r.currency)) ??
        []),
      ...(overview?.accounts.map((a) => a.currency) ?? []),
      ...(overview?.debtTotals.map((d) => d.currency) ?? []),
    ]),
  ];
  const totals = (overview?.months ?? [])
    .flatMap((m) => m.totals)
    .filter((r) => r.currency === currency)
    .reduce(
      (sum, r) => ({
        income: sum.income + Number(r.income),
        expense: sum.expense + Number(r.expense),
        net: sum.net + Number(r.net),
      }),
      { income: 0, expense: 0, net: 0 },
    );
  const debt = overview?.debtTotals.find((d) => d.currency === currency);
  const money = (n: number | string) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const display = (n: number | string) =>
    data.isLoading || data.error ? "—" : money(n);
  const accounts =
    overview?.accounts.filter(
      (a) =>
        a.currency === currency &&
        a.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ) ?? [];
  const upcoming = [...(overview?.debts ?? [])]
    .filter((d) => d.currency === currency && d.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 4);
  const links = [
    { to: "/accounting/overview", label: t("financeOverview.title") },
    { to: "/accounting/income-expenses", label: t("incomeExpenses.title") },
    { to: "/accounting/accounts", label: t("navigation.chartOfAccounts") },
    { to: "/accounting/journals", label: t("navigation.journalEntries") },
    { to: "/accounting/invoices", label: t("navigation.invoices") },
    { to: "/accounting/payments", label: t("navigation.payments") },
    { to: "/accounting/reports", label: t("navigation.financialReports") },
  ].filter((link) => hasPermission(user, permissionForPath(link.to)));
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 rounded-2xl bg-muted/30 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute inset-s-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cash accounts"
            aria-label="Search cash accounts"
            className="rounded-full border-0 bg-muted/40 ps-9"
          />
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-2">
          <span className="me-2 size-2 rounded-full bg-primary" />
          Accounting workspace
        </Badge>
      </div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("navigation.accountantDashboard")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Income, expenses, and accounts in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-28 rounded-full" aria-label="Year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: 31 },
                (_, i) => new Date().getFullYear() + 1 - i,
              ).map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-28 rounded-full" aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>
      {data.error && (
        <Card className="flex items-center justify-between p-4" role="alert">
          <p className="text-destructive">{data.error}</p>
          <Button variant="outline" onClick={() => void data.refresh()}>
            Retry
          </Button>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Income", value: totals.income },
          { label: "Total Expenses", value: totals.expense },
          { label: "Net Cash Flow", value: totals.net },
          { label: "Receivables", value: debt?.receivable ?? 0 },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            className={`rounded-2xl border-0 p-5 shadow-none ${i === 0 ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : ""}`}
          >
            <div className="flex justify-between gap-3">
              <h2 className="text-sm font-medium">{stat.label}</h2>
              <ArrowUpRight
                className={`size-7 shrink-0 rounded-full border p-1 ${i === 0 ? "border-white/30" : "border-border"}`}
              />
            </div>
            <p className="my-5 break-words text-3xl font-medium tabular-nums">
              {display(stat.value)}
            </p>
            <p
              className={`text-xs ${i === 0 ? "text-emerald-100" : "text-muted-foreground"}`}
            >
              {currency} · {i === 3 ? "Outstanding balance" : year}
            </p>
          </Card>
        ))}
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Card className="min-w-0 md:col-span-2 xl:col-span-8 rounded-2xl border-0 p-5 shadow-none">
          {data.isLoading ? (
            <p className="py-20 text-center text-muted-foreground">
              Loading financial activity…
            </p>
          ) : data.error ? (
            <p className="py-20 text-center text-muted-foreground">
              Financial data unavailable
            </p>
          ) : (
            <FinanceBarChart
              title="Cash Flow Activity"
              currency={currency}
              series={[
                { key: "income", label: "Income", color: "#00664f" },
                { key: "expense", label: "Expenses", color: "#78bfa6" },
              ]}
              rows={(overview?.months ?? []).map((m) => {
                const row = m.totals.find((r) => r.currency === currency);
                return {
                  label: new Date(year, m.month - 1, 1).toLocaleDateString(
                    undefined,
                    { month: "short" },
                  ),
                  values: {
                    income: Number(row?.income ?? 0),
                    expense: Number(row?.expense ?? 0),
                  },
                };
              })}
            />
          )}
        </Card>
        <Card className="min-w-0 md:col-span-2 xl:col-span-4 rounded-2xl border-0 p-5 shadow-none">
          <h2 className="mb-4 font-semibold">Accounting Tools</h2>
          {links.map((link) => (
            <Button
              key={link.to}
              asChild
              variant="ghost"
              className="w-full justify-between"
            >
              <Link to={link.to}>
                {link.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ))}
        </Card>
        <Card className="min-w-0 xl:col-span-4 rounded-2xl border-0 p-5 shadow-none">
          <h2 className="mb-5 font-semibold">Cash Accounts</h2>
          <div className="max-h-72 space-y-4 overflow-y-auto">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 p-3 text-primary">
                  <WalletCards className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.type}</p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {money(a.balance)} {a.currency}
                </span>
              </div>
            ))}
            {!accounts.length && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {data.isLoading ? "Loading accounts…" : "No matching accounts"}
              </p>
            )}
          </div>
        </Card>
        <Card className="min-w-0 xl:col-span-4 rounded-2xl border-0 p-5 shadow-none">
          <h2 className="mb-5 font-semibold">Outstanding Due Dates</h2>
          <div className="space-y-4">
            {upcoming.map((d) => (
              <div
                key={`${d.type}-${d.id}`}
                className="flex items-center gap-3"
              >
                <Clock3 className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.dueDate!).toLocaleDateString()} · {d.type}
                  </p>
                </div>
                <span className="text-sm tabular-nums">{money(d.amount)}</span>
              </div>
            ))}
            {!upcoming.length && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {data.isLoading
                  ? "Loading due dates…"
                  : "No outstanding due dates"}
              </p>
            )}
          </div>
        </Card>
        <div className="grid gap-4 md:col-span-2 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <h2 className="mb-5 font-semibold">Needs Attention</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Pending entries</span>
                <Badge variant="secondary">
                  {data.isLoading || data.error
                    ? "—"
                    : (overview?.pending ?? 0)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Unassigned entries</span>
                <Badge variant="secondary">
                  {data.isLoading || data.error
                    ? "—"
                    : (overview?.unassigned ?? 0)}
                </Badge>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border-0 bg-linear-to-br from-[#003c30] to-[#008260] p-5 text-white shadow-none">
            <WalletCards className="mb-4 size-6" />
            <h2 className="text-sm">Outstanding Payables</h2>
            <p className="my-4 break-words text-3xl font-medium">
              {display(debt?.payable ?? 0)}
            </p>
            <p className="text-xs text-emerald-100">
              {currency} · Amount remaining to pay
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
