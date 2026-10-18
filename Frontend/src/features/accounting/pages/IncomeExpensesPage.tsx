import { useServerTable } from "@/shared/hooks/useServerTable";
import { Link } from "react-router-dom";
import FinanceHistory from "./FinanceHistory";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, Pencil, Plus } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  ResourceState,
  TableResourceState,
} from "@/shared/components/ui/table-resource-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type Department = { id: string; name: string };
type Entry = {
  sourceType: string | null;
  sourceUrl: string | null;
  sourceId: string | null;
  createdBy: string | null;
  cashAccountId: string | null;
  id: string;
  flowDate: string;
  flowType: string;
  departmentId: string | null;
  department: Department | null;
  category: string;
  amount: string;
  currency: string;
  description: string;
  status: string;
};
type Totals = {
  currency: string;
  income: string;
  expense: string;
  net: string;
};
type Report = {
  departments: (Totals & { departmentId: string | null })[];
  totals: Totals[];
  breakdown: (Totals & { departmentId: string | null; category: string })[];
};
type Records = {
  items: Entry[];
  pagination: { page: number; totalPages: number; total: number };
};
const endpoint = "/finance/cash-flow";

export default function IncomeExpensesPage() {
  const { t, i18n } = useTranslation();
  const label = (key: string) => t(`incomeExpenses.${key}`);
  const money = (value: string) =>
    new Intl.NumberFormat(i18n.language === "ku" ? "ckb" : i18n.language, {
      maximumFractionDigits: 2,
    }).format(Number(value));
  const [filters, setFilters] = useState({
    status: "all",
    from: "",
    to: "",
    departmentId: "all",
    category: "all",
    currency: "all",
  });
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Entry | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Entry | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const user = storedUser();
  const can = (action: string) =>
    hasPermission(user, `finance.cash-flow.${action}`);
  const options = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<{
            departments: Department[];
            categories: string[];
            cashAccounts: { id: string; name: string; currency: string }[];
          }>(`${endpoint}/options`)
          .then((r) => r.data),
      [],
    ),
  );
  const data = useApiResource(
    useCallback(async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v && v !== "all"),
      );
      const [records, report] = await Promise.all([
        apiClient.get<Records>(endpoint, {
          params: { ...params, page, pageSize: 50 },
        }),
        apiClient.get<Report>(`${endpoint}/report`, { params }),
      ]);
      return { records: records.data, report: report.data };
    }, [filters, page]),
  );
  const reportFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v && v !== "all"),
  );
  const departmentRows = useServerTable<Report["departments"][number]>(
    endpoint + "/report/rows",
    { ...reportFilters, section: "departments" },
  );
  const breakdownRows = useServerTable<Report["breakdown"][number]>(
    endpoint + "/report/rows",
    { ...reportFilters, section: "breakdown" },
  );
  const changeFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const refresh = async () => {
    await Promise.all([
      data.refresh(),
      options.refresh(),
      departmentRows.refresh(),
      breakdownRows.refresh(),
    ]);
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const values: Record<string, unknown> = Object.fromEntries(
      new FormData(event.currentTarget),
    );
    values.cashAccountId =
      values.cashAccountId === "none" ? null : values.cashAccountId;
    if (editing?.sourceType)
      for (const key of Object.keys(values))
        if (!["departmentId", "category", "cashAccountId"].includes(key))
          delete values[key];
    try {
      if ((!editing?.sourceType && !values.flowDate) || !values.departmentId)
        throw new Error(label("required"));
      if (editing) await apiClient.patch(`${endpoint}/${editing.id}`, values);
      else await apiClient.post(endpoint, values);
      setEditing(undefined);
      await refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const approve = async (id: string) => {
    if (actionBusy) return;
    setActionBusy(true);
    setError("");
    try {
      await apiClient.post(`${endpoint}/${id}/approve`);
      await refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setActionBusy(false);
    }
  };
  const select = (
    name: string,
    items: { value: string; label: string }[],
    value: string,
    onChange?: (value: string) => void,
  ) => (
    <Select
      name={onChange ? undefined : name}
      {...(onChange
        ? { value, onValueChange: onChange }
        : { defaultValue: value })}
      required={!onChange}
    >
      <SelectTrigger aria-label={label(name)}>
        <SelectValue placeholder={label(name)} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const departments = (options.data?.departments ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }));
  const all = { value: "all", label: label("all") };
  const currencies = ["USD"].map((v) => ({ value: v, label: v }));
  const ready = !data.isLoading && !data.error && data.data;
  const pagination = data.data?.records.pagination;
  return (
    <div className="space-y-5">
      <Button permission="finance.overview.view" asChild variant="outline">
        <Link to="/accounting/overview">{t("financeOverview.title")}</Link>
      </Button>
      {error && editing === undefined && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{label("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {label("description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="size-4" />
                {label("filters")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{label("filters")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["from", "to"] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label>{label(key)}</Label>
                    <FormDatePicker
                      value={filters[key]}
                      onValueChange={(value) => changeFilter(key, value)}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>{label("departmentId")}</Label>
                  {select(
                    "departmentId",
                    [
                      all,
                      { value: "unassigned", label: label("unassigned") },
                      ...departments,
                    ],
                    filters.departmentId,
                    (v) => changeFilter("departmentId", v),
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{label("category")}</Label>
                  {select(
                    "category",
                    [
                      all,
                      ...(options.data?.categories ?? []).map((v) => ({
                        value: v,
                        label: v,
                      })),
                    ],
                    filters.category,
                    (v) => changeFilter("category", v),
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{label("currency")}</Label>
                  {select(
                    "currency",
                    [all, ...currencies],
                    filters.currency,
                    (v) => changeFilter("currency", v),
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{label("status")}</Label>
                  {select(
                    "status",
                    [
                      all,
                      ...["planned", "pending", "confirmed", "cancelled"].map(
                        (value) => ({ value, label: label(value) }),
                      ),
                    ],
                    filters.status,
                    (value) => changeFilter("status", value),
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      status: "all",
                      from: "",
                      to: "",
                      departmentId: "all",
                      category: "all",
                      currency: "all",
                    });
                    setPage(1);
                  }}
                >
                  {label("reset")}
                </Button>
                <DialogClose asChild>
                  <Button>{label("done")}</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          {can("create") && (
            <Button
              permission="create"
              disabled={
                options.isLoading || !!options.error || !departments.length
              }
              onClick={() => {
                setError("");
                setEditing(null);
              }}
            >
              <Plus className="size-4" />
              {label("add")}
            </Button>
          )}
        </div>
      </div>
      {options.error && (
        <p role="alert" className="text-destructive">
          {options.error}
        </p>
      )}
      {!options.isLoading && !options.error && !departments.length && (
        <p>{label("noDepartments")}</p>
      )}

      <ResourceState
        isLoading={data.isLoading}
        error={data.error}
        isEmpty={false}
      />
      {data.error && (
        <Button variant="outline" onClick={() => void data.refresh()}>
          {label("retry")}
        </Button>
      )}
      {ready && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {ready.report.totals.map((total) => (
              <Card key={total.currency} className="space-y-3 p-5">
                <h2 className="font-semibold">{total.currency}</h2>
                <dl className="grid grid-cols-3 gap-3">
                  {(["income", "expense", "net"] as const).map((key) => (
                    <div key={key}>
                      <dt className="text-sm text-muted-foreground">
                        {label(key)}
                      </dt>
                      <dd
                        className={`mt-1 font-bold tabular-nums ${key === "income" ? "text-emerald-600 dark:text-emerald-400" : key === "expense" ? "text-destructive" : ""}`}
                      >
                        {money(total[key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden">
            <h2 className="p-4 font-semibold">{label("departmentTotals")}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {["departmentId", "currency", "income", "expense", "net"].map(
                    (key) => (
                      <TableHead key={key}>{label(key)}</TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody {...departmentRows.tableProps}>
                <TableResourceState
                  isLoading={departmentRows.isLoading}
                  error={departmentRows.error}
                  isEmpty={!departmentRows.data?.length}
                  colSpan={5}
                />
                {(departmentRows.data ?? []).map((row) => (
                  <TableRow
                    key={JSON.stringify([row.departmentId, row.currency])}
                  >
                    <TableCell>
                      {departments.find((d) => d.value === row.departmentId)
                        ?.label ??
                        (row.departmentId || label("unassigned"))}
                    </TableCell>
                    <TableCell>{row.currency}</TableCell>
                    <TableCell>{money(row.income)}</TableCell>
                    <TableCell>{money(row.expense)}</TableCell>
                    <TableCell>{money(row.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card className="overflow-hidden">
            <h2 className="p-4 font-semibold">{label("breakdown")}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "departmentId",
                    "category",
                    "currency",
                    "income",
                    "expense",
                    "net",
                  ].map((key) => (
                    <TableHead key={key}>{label(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody {...breakdownRows.tableProps}>
                <TableResourceState
                  isLoading={breakdownRows.isLoading}
                  error={breakdownRows.error}
                  isEmpty={!breakdownRows.data?.length}
                  colSpan={6}
                />
                {(breakdownRows.data ?? []).map((row) => (
                  <TableRow
                    key={JSON.stringify([
                      row.departmentId,
                      row.category,
                      row.currency,
                    ])}
                  >
                    <TableCell>
                      {departments.find((d) => d.value === row.departmentId)
                        ?.label ??
                        (row.departmentId || label("unassigned"))}
                    </TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.currency}</TableCell>
                    <TableCell>{money(row.income)}</TableCell>
                    <TableCell>{money(row.expense)}</TableCell>
                    <TableCell>{money(row.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card className="overflow-hidden">
            <h2 className="p-4 font-semibold">{label("transactions")}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "flowDate",
                    "flowType",
                    "departmentId",
                    "category",
                    "descriptionField",
                    "amount",
                    "status",
                    "actions",
                  ].map((key) => (
                    <TableHead key={key}>{label(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody autoPaginate={false}>
                <TableResourceState
                  isLoading={false}
                  isEmpty={!ready.records.items.length}
                  colSpan={8}
                />
                {ready.records.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.flowDate.slice(0, 10)}</TableCell>
                    <TableCell>{label(row.flowType)}</TableCell>
                    <TableCell>
                      {row.department?.name ?? label("unassigned")}
                    </TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell className="max-w-64 whitespace-normal">
                      {row.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {money(row.amount)} {row.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{label(row.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {can("update") && (
                          <Button
                            permission="update"
                            variant="ghost"
                            size="icon"
                            aria-label={label("edit")}
                            onClick={() => {
                              setError("");
                              setEditing(row);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryId(row.id)}
                        >
                          {t("financeOverview.history")}
                        </Button>
                        {row.sourceUrl && (
                          <Button asChild variant="ghost" size="sm">
                            <Link to={row.sourceUrl}>
                              {t("financeOverview.source")}
                            </Link>
                          </Button>
                        )}
                        {row.status === "pending" &&
                          row.createdBy !== user?.id &&
                          (user?.permissions?.includes("*") ||
                            user?.permissions?.includes(
                              "finance.cash-flow.approve",
                            )) && (
                            <Button
                              permission="approve"
                              disabled={actionBusy}
                              size="sm"
                              onClick={() => void approve(row.id)}
                            >
                              {t("financeOverview.approve")}
                            </Button>
                          )}
                        {can("delete") &&
                          !row.sourceType &&
                          row.status !== "cancelled" && (
                            <Button
                              permission="delete"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelling(row)}
                            >
                              {t("financeOverview.cancelEntry")}
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
                <span className="text-sm">
                  {t("finance.pageSummary", {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    total: pagination.total,
                  })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    {t("finance.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    {t("finance.next")}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
      <FinanceHistory id={historyId} close={() => setHistoryId(null)} />
      <Dialog
        open={!!cancelling}
        onOpenChange={(open) => {
          if (!open && !actionBusy) setCancelling(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("financeOverview.cancelEntry")}</DialogTitle>
          </DialogHeader>
          <p>{t("financeOverview.cancelHint")}</p>
          <Button
            permission="delete"
            disabled={actionBusy}
            onClick={async () => {
              if (!cancelling || actionBusy) return;
              setActionBusy(true);
              setError("");
              try {
                await apiClient.delete(`${endpoint}/${cancelling.id}`);
                setCancelling(null);
                await refresh();
              } catch (cause) {
                setError(apiErrorMessage(cause));
              } finally {
                setActionBusy(false);
              }
            }}
          >
            {t("financeOverview.cancelEntry")}
          </Button>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{label(editing ? "edit" : "add")}</DialogTitle>
          </DialogHeader>
          <form
            key={editing?.id ?? "new"}
            onSubmit={submit}
            className="grid gap-4 sm:grid-cols-2"
          >
            <fieldset disabled={busy} className="contents">
              <fieldset disabled={!!editing?.sourceType} className="contents">
                {" "}
                <div className="space-y-2">
                  <Label>{label("flowDate")}</Label>
                  <FormDatePicker
                    name="flowDate"
                    initialValue={
                      editing?.flowDate.slice(0, 10) ??
                      new Date().toLocaleDateString("en-CA")
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{label("flowType")}</Label>
                  {select(
                    "flowType",
                    ["inflow", "outflow"].map((v) => ({
                      value: v,
                      label: label(v),
                    })),
                    editing?.flowType ?? "inflow",
                  )}
                </div>
              </fieldset>{" "}
              <div className="space-y-2">
                <Label>{label("departmentId")}</Label>
                {select(
                  "departmentId",
                  departments,
                  editing?.departmentId ?? "",
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-category">{label("category")}</Label>
                <Input
                  id="entry-category"
                  name="category"
                  defaultValue={editing?.category ?? ""}
                  minLength={2}
                  maxLength={191}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{label("cashAccountId")}</Label>
                {select(
                  "cashAccountId",
                  [
                    { value: "none", label: label("unassigned") },
                    ...(options.data?.cashAccounts ?? []).map((account) => ({
                      value: account.id,
                      label: `${account.name} (${account.currency})`,
                    })),
                  ],
                  editing?.cashAccountId ?? "none",
                )}
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                {t(
                  editing?.sourceType
                    ? "financeOverview.sourceHint"
                    : "financeOverview.approvalHint",
                )}
              </p>
              <fieldset disabled={!!editing?.sourceType} className="contents">
                {" "}
                <div className="space-y-2">
                  <Label htmlFor="entry-amount">{label("amount")}</Label>
                  <Input
                    id="entry-amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    max="999999999999.99"
                    step="0.01"
                    defaultValue={editing?.amount ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{label("currency")}</Label>
                  {select("currency", currencies, editing?.currency ?? "USD")}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="entry-description">
                    {label("descriptionField")}
                  </Label>
                  <Input
                    id="entry-description"
                    name="description"
                    defaultValue={editing?.description ?? ""}
                    minLength={2}
                    maxLength={191}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{label("status")}</Label>
                  {select(
                    "status",
                    ["confirmed", "planned", "pending", "cancelled"].map(
                      (v) => ({
                        value: v,
                        label: label(v),
                      }),
                    ),
                    editing?.status ?? "confirmed",
                  )}
                </div>
              </fieldset>{" "}
              {error && (
                <p
                  role="alert"
                  className="text-sm text-destructive sm:col-span-2"
                >
                  {error}
                </p>
              )}
              <Button
                permission={editing ? "update" : "create"}
                disabled={busy}
                className="sm:col-span-2"
              >
                {t(busy ? "finance.saving" : "finance.save")}
              </Button>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
