import { ArrowUpRight } from "lucide-react";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { useCallback, useState } from "react";
import { FinanceBarChart } from "../components/FinanceBarChart";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
type Total = { currency: string; income: string; expense: string; net: string };
export type Overview = {
  pending: number;
  unassigned: number;
  accounts: {
    id: string;
    name: string;
    type: string;
    currency: string;
    balance: string;
    openingDate: string;
  }[];
  unallocated: { currency: string; net: string }[];
  debtTotals: { currency: string; receivable: string; payable: string }[];
  debts: {
    id: string;
    type: string;
    name: string;
    reference: string;
    currency: string;
    amount: string;
    dueDate: string | null;
    url: string;
  }[];
  months: {
    month: number;
    totals: Total[];
    departments: (Total & { departmentId: string | null })[];
  }[];
};
export default function FinanceOverview() {
  const { t } = useTranslation();
  const l = (key: string) => t(`financeOverview.${key}`);
  const [year, setYear] = useState(new Date().getFullYear());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const data = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<Overview>("/finance/cash-flow/overview", { params: { year } })
          .then((r) => r.data),
      [year],
    ),
  );
  const options = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<{ departments: { id: string; name: string }[] }>(
            "/finance/cash-flow/options",
          )
          .then((r) => r.data),
      [],
    ),
  );
  const debts = useServerTable<Overview["debts"][number]>(
    "/finance/cash-flow/overview/rows",
    { year, section: "debts" },
  );
  const months = useServerTable<Total & { month: number }>(
    "/finance/cash-flow/overview/rows",
    { year, section: "months" },
  );
  const departments = useServerTable<
    Total & { month: number; departmentId: string | null }
  >("/finance/cash-flow/overview/rows", { year, section: "departments" });
  const ready = !data.isLoading && !data.error && data.data;
  const money = (v: string) =>
    Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const series = [
    { key: "income", label: l("income"), color: "#00664f" },
    { key: "expense", label: l("expense"), color: "#78bfa6" },
    { key: "net", label: l("net"), color: "#003c30" },
  ];
  const currencies = ready
    ? Array.from(
        new Set([
          "USD",
          ...ready.months.flatMap((month) =>
            month.totals.map((row) => row.currency),
          ),
        ]),
      )
    : [];
  const createAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiClient.post("/finance/cash-flow/cash-accounts", values);
      setOpen(false);
      await data.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 rounded-2xl bg-muted/30 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {l("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{l("description")}</p>
        </div>
        <Button permission="finance.cash-flow.view" asChild variant="outline">
          <Link to="/accounting/income-expenses">
            {t("incomeExpenses.title")}
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4">
        <Label htmlFor="finance-year">{l("year")}</Label>
        <Select
          value={String(year)}
          onValueChange={(value) => setYear(Number(value))}
        >
          <SelectTrigger id="finance-year" className="w-28 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 201 }, (_, index) => 2000 + index).map(
              (option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => void data.refresh()}>
          {l("refresh")}
        </Button>
      </div>
      {(debts.error || months.error || departments.error) && (
        <p role="alert" className="text-destructive">
          {debts.error || months.error || departments.error}
        </p>
      )}
      <ResourceState
        isLoading={data.isLoading}
        error={data.error}
        isEmpty={false}
      />
      {ready && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: l("cashAccounts"), value: ready.accounts.length },
              { label: l("pending"), value: ready.pending },
              { label: l("unassigned"), value: ready.unassigned },
              { label: l("year"), value: year },
            ].map((stat, index) => (
              <Card
                key={stat.label}
                className={`rounded-2xl border-0 p-5 shadow-none ${index === 0 ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-medium">{stat.label}</h2>
                  <ArrowUpRight
                    className={`size-7 rounded-full border p-1 ${index === 0 ? "border-white/30" : "border-border"}`}
                  />
                </div>
                <p className="mt-5 text-4xl font-medium tabular-nums">
                  {stat.value.toLocaleString(undefined, {
                    useGrouping: index !== 3,
                  })}
                </p>
              </Card>
            ))}
          </div>
          <div className="grid items-stretch gap-4 xl:grid-cols-2">
            <Card className="min-w-0 space-y-4 rounded-2xl border-0 bg-card p-5 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{l("cashAccounts")}</h2>
                {hasPermission(storedUser(), "finance.cash-flow.create") && (
                  <Button
                    className="rounded-full"
                    permission="finance.cash-flow.create"
                    onClick={() => {
                      setError("");
                      setOpen(true);
                    }}
                  >
                    {l("addAccount")}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {l("balanceHint")}
              </p>
              <div className="grid gap-4">
                {Array.from(
                  new Set(ready.accounts.map((account) => account.currency)),
                ).map((currency) => (
                  <FinanceBarChart
                    key={currency}
                    title={l("cashAccounts")}
                    currency={currency}
                    series={[
                      {
                        key: "balance",
                        label: l("cashAccounts"),
                        color: "#00664f",
                      },
                    ]}
                    rows={ready.accounts
                      .filter((account) => account.currency === currency)
                      .map((account) => ({
                        label: account.name,
                        values: { balance: Number(account.balance) },
                      }))}
                  />
                ))}
              </div>
              {!ready.accounts.length && <p>{l("noAccounts")}</p>}
              <div className="border-t pt-3 text-sm">
                <p>{l("unallocated")}</p>
                {ready.unallocated.map((row) => (
                  <span key={row.currency} className="me-5">
                    {money(row.net)} {row.currency}
                  </span>
                ))}
              </div>
            </Card>
            <Card className="min-w-0 space-y-4 rounded-2xl border-0 bg-card p-5 shadow-none">
              <h2 className="font-semibold">{l("debts")}</h2>
              <p className="text-xs text-muted-foreground">{l("debtHint")}</p>
              <div className="grid gap-4">
                {ready.debtTotals.map((row) => (
                  <FinanceBarChart
                    key={row.currency}
                    title={l("debts")}
                    currency={row.currency}
                    series={[
                      { key: "amount", label: l("amount"), color: "#003c30" },
                    ]}
                    rows={[
                      {
                        label: l("receivable"),
                        values: { amount: Number(row.receivable) },
                      },
                      {
                        label: l("payable"),
                        values: { amount: Number(row.payable) },
                      },
                    ]}
                  />
                ))}
              </div>
              <details className="group">
                <summary className="cursor-pointer p-3 text-sm font-medium">
                  {l("details")}
                </summary>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["type", "name", "reference", "amount", "dueDate"].map(
                        (key) => (
                          <TableHead key={key}>{l(key)}</TableHead>
                        ),
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody {...debts.tableProps}>
                    {(debts.data ?? []).map((row) => (
                      <TableRow key={`${row.type}:${row.id}`}>
                        <TableCell>{l(row.type)}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>
                          <Link className="text-primary underline" to={row.url}>
                            {row.reference}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {money(row.amount)} {row.currency}
                        </TableCell>
                        <TableCell>
                          {row.dueDate?.slice(0, 10) ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </details>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-card p-1 shadow-none xl:col-span-2">
              <h2 className="p-4 font-semibold">{l("monthly")}</h2>
              <div className="grid gap-4 px-4 pb-4">
                {currencies.map((currency) => (
                  <FinanceBarChart
                    key={currency}
                    title={l("monthly")}
                    currency={currency}
                    series={series}
                    rows={Array.from({ length: 12 }, (_, index) => {
                      const total = ready.months
                        .find((month) => month.month === index + 1)
                        ?.totals.find((row) => row.currency === currency);
                      return {
                        label: `${year}-${String(index + 1).padStart(2, "0")}`,
                        values: {
                          income: Number(total?.income ?? 0),
                          expense: Number(total?.expense ?? 0),
                          net: Number(total?.net ?? 0),
                        },
                      };
                    })}
                  />
                ))}
              </div>
              <details className="group">
                <summary className="cursor-pointer p-3 text-sm font-medium">
                  {l("details")}
                </summary>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["month", "currency", "income", "expense", "net"].map(
                        (key) => (
                          <TableHead key={key}>{l(key)}</TableHead>
                        ),
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody {...months.tableProps}>
                    {(months.data ?? []).map((row) => (
                      <TableRow key={`${row.month}:${row.currency}`}>
                        <TableCell>
                          {year}-{String(row.month).padStart(2, "0")}
                        </TableCell>
                        <TableCell>{row.currency}</TableCell>
                        <TableCell>{money(row.income)}</TableCell>
                        <TableCell>{money(row.expense)}</TableCell>
                        <TableCell>{money(row.net)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </details>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-card p-1 shadow-none xl:col-span-2">
              <h2 className="p-4 font-semibold">{l("departments")}</h2>
              <div className="grid gap-4 px-4 pb-4">
                {currencies.map((currency) => (
                  <FinanceBarChart
                    key={currency}
                    title={l("departments")}
                    currency={currency}
                    series={series}
                    rows={ready.months.flatMap((month) =>
                      month.departments
                        .filter((row) => row.currency === currency)
                        .map((row) => ({
                          label: `${String(month.month).padStart(2, "0")} · ${options.data?.departments.find((department) => department.id === row.departmentId)?.name ?? row.departmentId ?? t("incomeExpenses.unassigned")}`,
                          values: {
                            income: Number(row.income),
                            expense: Number(row.expense),
                            net: Number(row.net),
                          },
                        })),
                    )}
                  />
                ))}
              </div>
              <details className="group">
                <summary className="cursor-pointer p-3 text-sm font-medium">
                  {l("details")}
                </summary>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        "month",
                        "department",
                        "currency",
                        "income",
                        "expense",
                        "net",
                      ].map((key) => (
                        <TableHead key={key}>{l(key)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody {...departments.tableProps}>
                    {(departments.data ?? []).map((row) => (
                      <TableRow
                        key={`${row.month}:${row.departmentId}:${row.currency}`}
                      >
                        <TableCell>
                          {year}-{String(row.month).padStart(2, "0")}
                        </TableCell>
                        <TableCell>
                          {options.data?.departments.find(
                            (d) => d.id === row.departmentId,
                          )?.name ??
                            row.departmentId ??
                            t("incomeExpenses.unassigned")}
                        </TableCell>
                        <TableCell>{row.currency}</TableCell>
                        <TableCell>{money(row.income)}</TableCell>
                        <TableCell>{money(row.expense)}</TableCell>
                        <TableCell>{money(row.net)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </details>
            </Card>
          </div>
        </>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{l("addAccount")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={createAccount} className="space-y-3">
            <Label htmlFor="cash-name">{l("name")}</Label>
            <Input
              id="cash-name"
              name="name"
              required
              minLength={2}
              maxLength={191}
            />
            {["type", "currency"].map((key) => (
              <div key={key} className="space-y-2">
                <Label>{l(key)}</Label>
                <Select
                  name={key}
                  defaultValue={key === "type" ? "safe" : "USD"}
                >
                  <SelectTrigger aria-label={l(key)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(key === "type" ? ["safe", "bank"] : ["USD"]).map((v) => (
                      <SelectItem key={v} value={v}>
                        {key === "type" ? l(v) : v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Label htmlFor="opening-balance">{l("openingBalance")}</Label>
            <Input
              id="opening-balance"
              name="openingBalance"
              type="number"
              step="0.01"
              defaultValue="0"
              required
            />
            <Label>{l("openingDate")}</Label>
            <FormDatePicker name="openingDate" required />
            <p className="text-xs text-muted-foreground">{l("openingHint")}</p>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button permission="finance.cash-flow.create" disabled={busy}>
              {t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
