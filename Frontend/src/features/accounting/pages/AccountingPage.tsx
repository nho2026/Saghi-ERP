import { useFullReportPrint } from "@/shared/hooks/useFullReportPrint";
import type { AccountingReport } from "../api/accounting.api";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import {
  accountingApi,
  type Account,
  type Journal,
  type JournalLine,
} from "../api/accounting.api";

import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import logo from "@/assets/icons/logo.png";
import { settingsSnapshot } from "@/features/settings/settings";

export type AccountingResource = "accounts" | "journals" | "reports";
const money = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

export default function AccountingPage({
  resource,
}: {
  resource: AccountingResource;
}) {
  const { t } = useTranslation();
  const accounts = useApiResource(
    useCallback(() => accountingApi.accounts.list(), []),
  );
  const journals = useServerTable<Journal>(
    "/accounting/journals",
    {},
    resource === "journals",
  );
  const accountRows = useServerTable<Account>(
    "/accounting/accounts",
    {},
    resource === "accounts",
  );
  const [reportPage, setReportPage] = useState(1);
  const reports = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<
            AccountingReport & {
              pagination: import("@/shared/api/pagination").Pagination;
            }
          >("/accounting/reports", {
            params: { page: reportPage, pageSize: 20 },
          })
          .then((r) => r.data),
      [reportPage],
    ),
  );
  const [dialog, setDialog] = useState<"account" | "journal" | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", debit: 0, credit: 0 },
    { accountId: "", debit: 0, credit: 0 },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const title = t(`accounting.${resource}`);
  const submitAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const data = {
      ...form,
      parentId: form.parentId === "__none__" ? null : form.parentId,
    };
    try {
      if (editing) await accountingApi.accounts.update(editing.id, data);
      else await accountingApi.accounts.create(data);
      setDialog(null);
      await Promise.all([accounts.refresh(), accountRows.refresh()]);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const submitJournal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await accountingApi.journals.create({ ...form, lines });
      setDialog(null);
      await Promise.all([journals.refresh(), reports.refresh()]);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const fullPrint = useFullReportPrint(() => accountingApi.reports());
  if (resource === "reports") {
    const report = fullPrint.printData ?? reports.data;
    const summaries = [
      ["assets", report?.balanceSheet.assets],
      ["liabilities", report?.balanceSheet.liabilities],
      ["equity", report?.balanceSheet.equity],
      ["revenue", report?.profitLoss.revenue],
      ["expenses", report?.profitLoss.expenses],
      ["netIncome", report?.profitLoss.netIncome],
    ] as const;
    const accountName = (code: string, fallback: string) =>
      t(`accounting.seedAccounts.${code}`, { defaultValue: fallback });
    const totalDebit = report?.totals?.debit ?? 0;
    const totalCredit = report?.totals?.credit ?? 0;
    const generatedDate = new Date().toISOString().slice(0, 10);
    return (
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {t("accounting.reportDescription")}
            </p>
          </div>
          <Button
            permission="accounting.reports.print"
            variant="outline"
            disabled={fullPrint.printing || reports.isLoading}
            onClick={() => void fullPrint.print()}
          >
            <Printer />
            {t("accounting.printReport")}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {summaries.map(([key, value]) => (
            <Card key={key} className="border-border/60 shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {t(`accounting.${key}`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-bold">
                {money(Number(value ?? 0))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              {t("accounting.trialBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accounting.code")}</TableHead>
                  <TableHead>{t("accounting.account")}</TableHead>
                  <TableHead>{t("accounting.type")}</TableHead>
                  <TableHead>{t("accounting.debit")}</TableHead>
                  <TableHead>{t("accounting.credit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                autoPaginate={false}
                pagination={{
                  page: report?.pagination?.page ?? reportPage,
                  totalPages: report?.pagination?.totalPages ?? 1,
                  total: report?.pagination?.total ?? 0,
                  onPageChange: setReportPage,
                  disabled: reports.isLoading,
                }}
              >
                <TableResourceState
                  isLoading={reports.isLoading}
                  error={reports.error}
                  isEmpty={!report?.trialBalance.length}
                  colSpan={5}
                />
                {report?.trialBalance.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.code}</TableCell>
                    <TableCell className="font-medium">
                      {accountName(row.code, row.name)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(`accounting.types.${row.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{money(row.debit)}</TableCell>
                    <TableCell>{money(row.credit)}</TableCell>
                  </TableRow>
                ))}
                {report && (
                  <TableRow className="bg-muted/60 font-bold">
                    <TableCell colSpan={3}>{t("accounting.total")}</TableCell>
                    <TableCell>{money(totalDebit)}</TableCell>
                    <TableCell>{money(totalCredit)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {report && (
          <section className="print-document hidden bg-white px-[9mm] py-[7mm] text-[10px] text-slate-900 print:absolute print:inset-0 print:block print:w-full [&_td]:border [&_td]:border-slate-300 [&_td]:px-1.75 [&_td]:py-1.25 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-teal-50 [&_th]:px-1.75 [&_th]:py-1.25 [&_th]:font-bold [&_table]:w-full [&_table]:border-collapse [&_tbody_tr:nth-child(even)]:bg-slate-50">
            <header className="mb-2.5 flex items-center justify-between border-b-[3px] border-teal-500 pb-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  className="h-11 w-23 rounded-[9px] border border-slate-200 bg-white px-2 py-1 object-contain object-center shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
                  src={logo}
                  alt={settingsSnapshot()?.organization.name || ""}
                />
                <div>
                  <strong className="block text-[13px]">
                    {settingsSnapshot()?.organization.name || ""}
                  </strong>
                  <small className="mt-0.5 block text-slate-500">
                    {t("accounting.organizationSubtitle")}
                  </small>
                </div>
              </div>
              <div className="grid gap-0.5 text-end text-slate-500">
                <b className="text-[13px] text-teaborder-teal-500">
                  {t("accounting.reports")}
                </b>
                <span>
                  {t("accounting.generatedAt")}: {generatedDate}
                </span>
                <span>{t("accounting.currencyLabel")}: USD</span>
              </div>
            </header>
            <div className="my-3.5 text-center">
              <span className="text-[9px] uppercase tracking-[0.12em] text-slate-500">
                {t("accounting.financialStatement")}
              </span>
              <h1 className="mt-0.5 text-xl font-extrabold text-slate-900">
                {t("accounting.trialBalance")}
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-1.75">
              {summaries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[5px] border border-slate-200 border-s-3 border-s-cyan-600 bg-slate-50 px-2.5 py-2"
                >
                  <span className="block text-[8px] text-slate-500">
                    {t(`accounting.${key}`)}
                  </span>
                  <b className="mt-0.5 block text-[13px]">
                    {money(Number(value ?? 0))}
                  </b>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-[13px] font-bold">
                {t("accounting.accountBalances")}
              </h2>
              <span className="text-slate-500">
                {report.trialBalance.length} {t("accounting.accountsCount")}
              </span>
            </div>
            <table className="mt-1.75 [&_td:nth-last-child(-n+2)]:text-end [&_td:nth-last-child(-n+2)]:tabular-nums [&_th:nth-last-child(-n+2)]:text-end [&_th:nth-last-child(-n+2)]:tabular-nums [&_tfoot_th]:border-t-2 [&_tfoot_th]:border-t-teaborder-teal-500">
              <thead>
                <tr>
                  <th>{t("accounting.code")}</th>
                  <th>{t("accounting.account")}</th>
                  <th>{t("accounting.type")}</th>
                  <th>{t("accounting.debit")}</th>
                  <th>{t("accounting.credit")}</th>
                </tr>
              </thead>
              <tbody>
                {report.trialBalance.map((row) => (
                  <tr key={row.id}>
                    <td className="font-mono text-slate-600">{row.code}</td>
                    <td>{accountName(row.code, row.name)}</td>
                    <td>{t(`accounting.types.${row.type}`)}</td>
                    <td>{money(row.debit)}</td>
                    <td>{money(row.credit)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3}>{t("accounting.total")}</th>
                  <th>{money(totalDebit)}</th>
                  <th>{money(totalCredit)}</th>
                </tr>
              </tfoot>
            </table>
            <div className="mt-2.5 flex justify-between rounded-[5px] bg-emerald-50 px-2.5 py-1.75 text-emerald-700">
              <span>{t("accounting.balanceCheck")}</span>
              <b>
                {Math.abs(totalDebit - totalCredit) < 0.001
                  ? t("accounting.balanced")
                  : t("accounting.unbalanced")}
              </b>
            </div>
            <footer className="mt-4.5 flex justify-between border-t border-slate-300 pt-1.75 text-[8px] text-slate-500">
              <span>{t("accounting.confidentialReport")}</span>
              <span>
                {settingsSnapshot()?.organization.name || ""} · {generatedDate}
              </span>
            </footer>
          </section>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {t(`accounting.${resource}Description`)}
          </p>
        </div>
        <Button
          permission="create"
          onClick={() => {
            setError("");
            setEditing(null);
            setLines([
              { accountId: "", debit: 0, credit: 0 },
              { accountId: "", debit: 0, credit: 0 },
            ]);
            setDialog(resource === "accounts" ? "account" : "journal");
          }}
        >
          <Plus />
          {t("accounting.add")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {(resource === "accounts"
                  ? ["code", "account", "type", "currency", "status", "actions"]
                  : [
                      "entryNumber",
                      "date",
                      "description",
                      "debit",
                      "credit",
                      "status",
                      "actions",
                    ]
                ).map((key) => (
                  <TableHead key={key}>{t(`accounting.${key}`)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody
              {...(resource === "accounts"
                ? accountRows.tableProps
                : journals.tableProps)}
            >
              {resource === "accounts" ? (
                <>
                  <TableResourceState
                    isLoading={accounts.isLoading}
                    error={accounts.error}
                    isEmpty={!accountRows.data?.length}
                    colSpan={6}
                  />
                  {accountRows.data?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{t(`accounting.types.${row.type}`)}</TableCell>
                      <TableCell>{row.currency}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {t(`accounting.${row.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            data-action="edit"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditing(row);
                              setDialog("account");
                            }}
                          >
                            <Pencil />
                          </Button>
                          <DeleteConfirmationDialog
                            description={t("accounting.deleteConfirm")}
                            onConfirm={async () => {
                              await accountingApi.accounts.remove(row.id);
                              await Promise.all([
                                accounts.refresh(),
                                accountRows.refresh(),
                              ]);
                            }}
                          >
                            <Button
                              data-action="delete"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                            >
                              <Trash2 className="size-4 text-white" />
                            </Button>
                          </DeleteConfirmationDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  <TableResourceState
                    isLoading={journals.isLoading}
                    error={journals.error}
                    isEmpty={!journals.data?.length}
                    colSpan={7}
                  />
                  {journals.data?.map((row) => {
                    const debit = row.lines.reduce((s, l) => s + l.debit, 0);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{row.entryNumber}</TableCell>
                        <TableCell>
                          {new Intl.DateTimeFormat().format(
                            new Date(row.entryDate),
                          )}
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{money(debit)}</TableCell>
                        <TableCell>{money(debit)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {t(`accounting.${row.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            {row.status === "draft" && (
                              <>
                                <Button
                                  permission="post"
                                  variant="ghost"
                                  size="icon"
                                  onClick={async () => {
                                    await accountingApi.journals.post(row.id);
                                    await Promise.all([
                                      journals.refresh(),
                                      reports.refresh(),
                                    ]);
                                  }}
                                >
                                  <CheckCircle2 />
                                </Button>
                                <Button
                                  data-action="delete"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={async () => {
                                    await accountingApi.journals.remove(row.id);
                                    await journals.refresh();
                                  }}
                                >
                                  <Trash2 className="size-4 text-white" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog
        open={dialog === "account"}
        onOpenChange={(open) => !open && !busy && setDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(editing ? "accounting.editAccount" : "accounting.addAccount")}
            </DialogTitle>
          </DialogHeader>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitAccount}>
            {[
              ["code", "code"],
              ["name", "account"],
            ].map(([name, label]) => (
              <label className="space-y-1 text-xs font-medium" key={name}>
                {t(`accounting.${label}`)}
                <Input
                  name={name}
                  defaultValue={String(editing?.[name as keyof Account] ?? "")}
                  required
                />
              </label>
            ))}
            <Select name="type" defaultValue={editing?.type ?? "asset"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["asset", "liability", "equity", "revenue", "expense"].map(
                  (v) => (
                    <SelectItem key={v} value={v}>
                      {t(`accounting.types.${v}`)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Input name="currency" value="USD" readOnly required />
            <Select
              name="parentId"
              defaultValue={editing?.parent?.id ?? "__none__"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t("accounting.none")}</SelectItem>
                {accounts.data
                  ?.filter((a) => a.id !== editing?.id)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select name="status" defaultValue={editing?.status ?? "active"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("accounting.active")}</SelectItem>
                <SelectItem value="inactive">
                  {t("accounting.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-destructive sm:col-span-2">{error}</p>
            )}
            <Button
              permission={editing ? "update" : "create"}
              disabled={busy}
              className="sm:col-span-2"
            >
              {t("accounting.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === "journal"}
        onOpenChange={(open) => !open && !busy && setDialog(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("accounting.addJournal")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitJournal}>
            <div className="grid gap-3 sm:grid-cols-3">
              <FormDatePicker name="entryDate" required />
              <Input
                name="description"
                placeholder={t("accounting.description")}
                required
              />
              <Input name="reference" placeholder={t("accounting.reference")} />
            </div>
            <div className="space-y-2">
              {lines.map((line, index) => (
                <div
                  className="grid grid-cols-[1fr_120px_120px_36px] gap-2"
                  key={index}
                >
                  <Select
                    value={line.accountId}
                    onValueChange={(accountId) =>
                      setLines((v) =>
                        v.map((x, i) =>
                          i === index ? { ...x, accountId } : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("accounting.account")} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.data?.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t("accounting.debit")}
                    value={line.debit || ""}
                    onChange={(e) =>
                      setLines((v) =>
                        v.map((x, i) =>
                          i === index
                            ? { ...x, debit: Number(e.target.value), credit: 0 }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t("accounting.credit")}
                    value={line.credit || ""}
                    onChange={(e) =>
                      setLines((v) =>
                        v.map((x, i) =>
                          i === index
                            ? { ...x, credit: Number(e.target.value), debit: 0 }
                            : x,
                        ),
                      )
                    }
                  />
                  <Button
                    permission="view"
                    data-action="delete"
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={lines.length <= 2}
                    onClick={() =>
                      setLines((v) => v.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-4 text-white" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setLines((v) => [...v, { accountId: "", debit: 0, credit: 0 }])
              }
            >
              <Plus />
              {t("accounting.addLine")}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button permission="create" className="w-full" disabled={busy}>
              {t("accounting.saveDraft")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
