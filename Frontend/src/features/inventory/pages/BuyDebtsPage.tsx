import { Badge } from "@/shared/components/ui/badge";
import { debtPrintStyles } from "../lib/debt-print";
import {
  PurchaseFilters,
  type PurchaseExtraFilters,
} from "../components/PurchaseFilters";
import { hasPermission } from "@/features/auth/access";
import { randomId } from "@/shared/lib/random-id";
import { Card } from "@/shared/components/ui/card";
import { settingsSnapshot } from "@/features/settings/settings";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";
import { Label } from "@/shared/components/ui/label";
import { useCallback, useDeferredValue, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, PieChart, Printer } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import { productImageUrl } from "../api/inventory.api";
type Debt = {
  id: string;
  invoiceNumber: string;
  retailer: string;
  salesperson: string;
  buyDate: string;
  paidAmount: string;
  totalPrice: string;
  note: string;
  hasInvoice: boolean;
  attachmentUrl: string | null;
  items: {
    productName: string;
    warehouseName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  payments: { id: string; amount: string; paidAt: string; note: string }[];
};
const columns = [
  "invoiceNumber",
  "retailer",
  "salesperson",
  "totalProducts",
  "hasInvoice",
  "status",
  "date",
  "paid",
  "totalPrice",
] as const;
type Column = (typeof columns)[number];
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export default function BuyDebtsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search);
  const [extraFilters, setExtraFilters] = useState<PurchaseExtraFilters>({});
  const [hasInvoice, setHasInvoice] = useState("");
  const [retailer, setRetailer] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const visible: Column[] = [...columns];
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selected, setSelected] = useState<Debt | null>(null);
  const [paying, setPaying] = useState<Debt | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const paymentId = useRef("");
  const canPay = hasPermission(storedUser(), "inventory.purchases.pay");
  const result = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<{
            items: Debt[];
            pagination: { total: number; totalPages: number };
            summary: {
              totalPrice: string;
              paidAmount: string;
              outstanding: number;
            };
          }>("/inventory/purchase-debts", {
            params: {
              ...extraFilters,
              search: query,
              retailer,
              hasInvoice,
              status,
              page,
              pageSize: 10,
            },
          })
          .then((r) => r.data),
      [query, retailer, hasInvoice, status, page, extraFilters],
    ),
  );
  const money = (v: string | number | null | undefined) =>
    v == null || v === "" || !Number.isFinite(Number(v))
      ? "—"
      : new Intl.NumberFormat(i18n.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(v));
  const balance = (row: Debt) =>
    (Math.round(Number(row.totalPrice) * 100) -
      Math.round(Number(row.paidAmount) * 100)) /
    100;
  const state = (row: Debt) =>
    balance(row) <= 0
      ? "paid"
      : Number(row.paidAmount) > 0
        ? "partial"
        : "unpaid";
  const label = (key: Column) =>
    t(
      key === "hasInvoice"
        ? "buyHistory.invoiceFilter"
        : ["status", "date", "paid"].includes(key)
          ? `buyDebts.${key}`
          : key === "totalProducts"
            ? "buyHistory.totalProducts"
            : `buyProductForm.${key}`,
    );
  const value = (row: Debt, key: Column): string | number =>
    key === "hasInvoice"
      ? t(
          row.hasInvoice
            ? "buyHistory.withInvoice"
            : "buyHistory.withoutInvoice",
        )
      : key === "totalProducts"
        ? row.items.length
        : key === "date"
          ? new Date(row.buyDate).toLocaleDateString(i18n.language)
          : key === "paid"
            ? money(row.paidAmount)
            : key === "totalPrice"
              ? money(row.totalPrice)
              : key === "status"
                ? t(`buyDebts.${state(row)}`)
                : row[key] || "—";
  const print = (rows: Debt[], invoice = false) => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    win.opener = null;
    const row = invoice ? rows[0] : undefined;
    const heading = (key: string) => esc(t(key));
    const printedTotal =
      rows.reduce(
        (sum, debt) => sum + Math.round(Number(debt.totalPrice) * 100),
        0,
      ) / 100;
    const printedPaid =
      rows.reduce(
        (sum, debt) => sum + Math.round(Number(debt.paidAmount) * 100),
        0,
      ) / 100;
    const total = row ? row.totalPrice : (result.data?.summary.totalPrice ?? 0);
    const paid = row ? row.paidAmount : (result.data?.summary.paidAmount ?? 0);
    const remaining = row
      ? balance(row)
      : (result.data?.summary.outstanding ?? 0);
    const metric = (key: string, amount: string | number, emphasized = false) =>
      `<div class="metric${emphasized ? " balance" : ""}"><span>${heading(key)}</span><strong>${esc(money(amount))}</strong></div>`;
    const numberCell = (amount: string | number) =>
      `<td class="number">${esc(money(amount))}</td>`;
    const statusLabel = (debt: Debt) =>
      `<span class="status ${state(debt)}">${heading(`buyDebts.${state(debt)}`)}</span>`;
    const metadata = row
      ? `<div class="details">${[
          ["buyProductForm.invoiceNumber", row.invoiceNumber],
          ["buyProductForm.retailer", row.retailer],
          [
            "buyDebts.date",
            new Date(row.buyDate).toLocaleDateString(i18n.language),
          ],
          ["buyProductForm.salesperson", row.salesperson || "—"],
          [
            "buyHistory.invoiceFilter",
            t(
              row.hasInvoice
                ? "buyHistory.withInvoice"
                : "buyHistory.withoutInvoice",
            ),
          ],
        ]
          .map(
            ([key, content]) =>
              `<p><span class="muted">${heading(key)}</span><br><strong>${esc(content)}</strong></p>`,
          )
          .join(
            "",
          )}<p><span class="muted">${heading("buyDebts.status")}</span><br>${statusLabel(row)}</p></div>`
      : `<p class="muted">${heading("buyDebts.printScope")}</p>`;
    const itemTable = row
      ? `<h2>${heading("buyProductForm.items")}</h2><table><colgroup><col style="width:32%"><col style="width:20%"><col style="width:16%"><col style="width:15%"><col style="width:17%"></colgroup><thead><tr>${["product", "storage", "quantity", "price", "totalPrice"].map((key, index) => `<th${index >= 2 ? ' class="number"' : ""}>${heading(`buyProductForm.${key}`)}</th>`).join("")}</tr></thead><tbody>${row.items.map((item) => `<tr><td>${esc(item.productName || "—")}</td><td>${esc(item.warehouseName || "—")}</td><td class="number">${esc(item.quantity ?? "—")}</td>${numberCell(item.price)}${numberCell(item.totalPrice)}</tr>`).join("")}<tr class="total-row"><td colspan="4">${heading("buyProductForm.totalPrice")}</td>${numberCell(row.totalPrice)}</tr></tbody></table>`
      : `<h2>${heading("warehouseModule.buyDebts")}</h2><table><colgroup><col style="width:12%"><col style="width:23%"><col style="width:13%"><col style="width:13%"><col style="width:13%"><col style="width:12%"><col style="width:14%"></colgroup><thead><tr>${["buyProductForm.invoiceNumber", "buyProductForm.retailer", "buyDebts.date", "buyDebts.status", "buyProductForm.totalPrice", "buyDebts.paid", "buyDebts.remaining"].map((key, index) => `<th${index >= 4 ? ' class="number"' : ""}>${heading(key)}</th>`).join("")}</tr></thead><tbody>${rows.map((debt) => `<tr><td>${esc(debt.invoiceNumber)}</td><td>${esc(debt.retailer)}</td><td>${esc(new Date(debt.buyDate).toLocaleDateString(i18n.language))}</td><td>${statusLabel(debt)}</td>${numberCell(debt.totalPrice)}${numberCell(debt.paidAmount)}${numberCell(balance(debt))}</tr>`).join("")}<tr class="total-row"><td colspan="4">${heading("buyDebts.printedTotals")}</td>${numberCell(printedTotal)}${numberCell(printedPaid)}${numberCell((Math.round(printedTotal * 100) - Math.round(printedPaid * 100)) / 100)}</tr></tbody></table>`;
    const payments = row
      ? `<h2>${heading("buyDebts.payments")}</h2>${row.payments.length ? `<table><colgroup><col style="width:30%"><col style="width:22%"><col style="width:48%"></colgroup><thead><tr><th>${heading("buyDebts.date")}</th><th class="number">${heading("buyDebts.amount")}</th><th>${heading("buyProductForm.note")}</th></tr></thead><tbody>${row.payments.map((payment) => `<tr><td>${esc(new Date(payment.paidAt).toLocaleString(i18n.language))}</td>${numberCell(payment.amount)}<td>${esc(payment.note || "—")}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">${heading("buyDebts.noPayments")}</p>`}${row.note ? `<h2>${heading("buyProductForm.note")}</h2><p class="note">${esc(row.note)}</p>` : ""}`
      : "";
    const reportReference = row
      ? `${heading("buyProductForm.invoiceNumber")} · ${esc(row.invoiceNumber)}`
      : heading("buyDebts.summary");
    win.document
      .write(`<!doctype html><html lang="${esc(i18n.language)}" dir="${i18n.dir()}">
      <head><meta charset="utf-8"><title>${heading("warehouseModule.buyDebts")}${row ? ` · ${esc(row.invoiceNumber)}` : ""}</title><style>${debtPrintStyles}</style></head>
      <body>
        <header>
          <div><span class="brand">${esc(settingsSnapshot()?.organization.name || "")}</span><h1>${heading("warehouseModule.buyDebts")}</h1></div>
          <div class="report-meta"><strong>${reportReference}</strong><p class="muted">${esc(new Date().toLocaleString(i18n.language))}</p></div>
        </header>
        <h2>${heading("buyDebts.summary")}</h2>
        ${row ? "" : `<p class="muted">${heading("buyDebts.filteredTotal")}</p>`}
        <section class="overview">${metric("buyProductForm.totalPrice", total)}${metric("buyDebts.paid", paid)}${metric("buyDebts.remaining", remaining, true)}</section>
        ${metadata}${itemTable}${payments}
        <footer><strong>${esc(settingsSnapshot()?.organization.name || "")}</strong><span>${row ? reportReference : esc(t("buyHistory.pagination", { page, pages: result.data?.pagination.totalPages ?? 1, total: result.data?.pagination.total ?? 0 }))}</span></footer>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };
  const pay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!paying || lock.current || !canPay) return;
    setError("");
    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      Number(amount) > balance(paying)
    ) {
      setError(t("buyDebts.invalidAmount"));
      return;
    }
    lock.current = true;
    setSaving(true);
    try {
      await apiClient.post(`/inventory/purchases/${paying.id}/pay`, {
        requestId: paymentId.current,
        amount: Number(amount),
        note,
      });
      setPaying(null);
      if (result.data?.items.length === 1 && page > 1 && status)
        setPage((p) => p - 1);
      else await result.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSaving(false);
      lock.current = false;
    }
  };
  return (
    <div className="space-y-4 pb-8">
      <header className="flex items-center gap-3 border-b pb-4">
        <h1 className="text-xl font-semibold">
          {t("warehouseModule.buyDebts")}
        </h1>
      </header>
      {(result.error || (error && !paying)) && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {result.error || error}
        </p>
      )}
      <Card className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-4 py-3 font-semibold">
          {t("buyDebts.totalDebts")}:{" "}
          {result.isLoading || result.error
            ? "—"
            : money(result.data?.summary.outstanding ?? 0)}
          <span className="ms-3 text-xs font-normal text-muted-foreground">
            {t("buyDebts.filteredTotal")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          <Input
            className="w-full sm:w-72"
            aria-label={t("buyHistory.search")}
            placeholder={t("buyHistory.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <PurchaseFilters
            value={{ ...extraFilters, retailer, hasInvoice, status }}
            onApply={(filters) => {
              const {
                retailer: _retailer,
                hasInvoice: _hasInvoice,
                status: _status,
                ...extra
              } = filters;
              setExtraFilters(extra);
              setRetailer(filters.retailer);
              setHasInvoice(filters.hasInvoice);
              setStatus(filters.status ?? "");
              setPage(1);
            }}
          />
          <Button
            className="bg-primary text-white hover:bg-primary/90"
            size="icon"
            aria-label={t("buyDebts.summary")}
            onClick={() => setSummaryOpen(true)}
            disabled={!result.data || result.isLoading}
          >
            <PieChart className="size-4" />
          </Button>
          <div className="ms-auto"></div>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                {columns
                  .filter((k) => visible.includes(k))
                  .map((k) => (
                    <TableHead
                      key={k}
                      className="whitespace-nowrap px-4 py-3 text-start text-xs font-medium text-muted-foreground"
                    >
                      {label(k)}
                    </TableHead>
                  ))}
                <TableHead>
                  <span className="sr-only">{t("buyHistory.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {result.isLoading ||
              result.error ||
              !result.data?.items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={visible.length + 1}
                    className="p-12 text-center text-muted-foreground"
                  >
                    {t(
                      result.isLoading
                        ? "resourceState.loading"
                        : result.error
                          ? "warehouseDashboard.unavailable"
                          : "buyDebts.empty",
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                result.data.items.map((row) => (
                  <TableRow key={row.id} className="border-t">
                    {columns
                      .filter((k) => visible.includes(k))
                      .map((key) => (
                        <TableCell key={key} className="px-4 py-3">
                          {key === "status" ? (
                            <Badge
                              variant="outline"
                              className={`min-w-16 justify-center ${state(row) === "paid" ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300" : state(row) === "partial" ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"}`}
                            >
                              {value(row, key)}
                            </Badge>
                          ) : (
                            value(row, key)
                          )}
                        </TableCell>
                      ))}
                    <TableCell className="px-2 py-2">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          permission="print"
                          size="icon"
                          className="size-8 bg-primary text-white hover:bg-primary/90"
                          aria-label={`${t("buyHistory.print")} ${row.invoiceNumber}`}
                          onClick={() => print([row], true)}
                        >
                          <Printer className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8"
                          aria-label={`${t("buyHistory.view")} ${row.invoiceNumber}`}
                          onClick={() => setSelected(row)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        {canPay && (
                          <Button
                            permission="inventory.purchases.pay"
                            size="sm"
                            className="h-8 bg-primary text-white hover:bg-primary/90"
                            disabled={balance(row) <= 0}
                            onClick={() => {
                              setPaying(row);
                              setAmount(balance(row).toFixed(2));
                              setNote("");
                              setError("");
                              paymentId.current = randomId();
                            }}
                          >
                            {t("buyDebts.pay")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
          <span className="text-xs text-muted-foreground">
            {t("buyHistory.pagination", {
              page,
              pages: result.data?.pagination.totalPages ?? 1,
              total: result.data?.pagination.total ?? 0,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              permission="print"
              size="icon"
              className="size-8 bg-primary text-white hover:bg-primary/90"
              disabled={
                result.isLoading || !!result.error || !result.data?.items.length
              }
              aria-label={t("buyDebts.printPage")}
              title={t("buyDebts.printPage")}
              onClick={() => print(result.data?.items ?? [])}
            >
              <Printer className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={result.isLoading || page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("buyHistory.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                result.isLoading ||
                page >= (result.data?.pagination.totalPages ?? 1)
              }
              onClick={() => setPage((p) => p + 1)}
            >
              {t("buyHistory.next")}
            </Button>
          </div>
        </footer>
      </Card>
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("buyDebts.summary")}</DialogTitle>
            <DialogDescription>{t("buyDebts.filteredTotal")}</DialogDescription>
          </DialogHeader>
          {result.data && (
            <>
              <div
                className="flex h-4 overflow-hidden rounded-full bg-red-200"
                aria-hidden="true"
              >
                <div
                  className="bg-emerald-500"
                  style={{
                    width: `${Number(result.data.summary.totalPrice) > 0 ? (Number(result.data.summary.paidAmount) / Number(result.data.summary.totalPrice)) * 100 : 0}%`,
                  }}
                />
              </div>
              {[
                ["totalPrice", result.data.summary.totalPrice],
                ["paid", result.data.summary.paidAmount],
                ["remaining", result.data.summary.outstanding],
              ].map(([key, amount]) => (
                <p key={key} className="flex justify-between text-sm">
                  <span>
                    {t(
                      key === "totalPrice"
                        ? "buyProductForm.totalPrice"
                        : `buyDebts.${key}`,
                    )}
                  </span>
                  <strong>{money(amount)}</strong>
                </p>
              ))}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t("buyProductForm.invoiceNumber")} · {selected?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>{selected?.retailer}</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <p className="text-sm">
                {t("buyDebts.date")}:{" "}
                {new Date(selected.buyDate).toLocaleDateString(i18n.language)} ·{" "}
                {t("buyProductForm.salesperson")}: {selected.salesperson || "—"}
              </p>
              <div className="overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow>
                      {[
                        "product",
                        "storage",
                        "quantity",
                        "price",
                        "totalPrice",
                      ].map((key) => (
                        <TableHead
                          key={key}
                          className="border-b p-2 text-start"
                        >
                          {t(`buyProductForm.${key}`)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody autoPaginate={false}>
                    {selected.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="p-2">
                          {item.productName}
                        </TableCell>
                        <TableCell className="p-2">
                          {item.warehouseName}
                        </TableCell>
                        <TableCell className="p-2">{item.quantity}</TableCell>
                        <TableCell className="p-2">
                          {money(item.price)}
                        </TableCell>
                        <TableCell className="p-2">
                          {money(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="font-semibold">
                {t("buyDebts.remaining")}: {money(balance(selected))}
              </p>
              <p className="whitespace-pre-wrap text-sm">{selected.note}</p>
              {selected.attachmentUrl && (
                <a
                  href={productImageUrl(selected.attachmentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  {t("buyProductForm.attachment")}
                </a>
              )}
              <h3 className="font-semibold">{t("buyDebts.payments")}</h3>
              {selected.payments.length ? (
                selected.payments.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3 text-sm">
                    <p>
                      {new Date(p.paidAt).toLocaleString(i18n.language)} ·{" "}
                      <strong>{money(p.amount)}</strong>
                    </p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {p.note}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("buyDebts.noPayments")}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!paying}
        onOpenChange={(open) => {
          if (!open && !saving) setPaying(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("buyDebts.pay")} · {paying?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>{t("buyDebts.recordHint")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={pay} className="space-y-4">
            <p className="text-sm">
              {t("buyDebts.remaining")}:{" "}
              <strong>{money(paying ? balance(paying) : 0)}</strong>
            </p>
            <Label className="block space-y-2 text-sm">
              {t("buyDebts.amount")}
              <Input
                autoFocus
                type="number"
                min="0.01"
                max={paying ? balance(paying) : 0}
                step="0.01"
                required
                disabled={saving}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Label>
            <Label className="block space-y-2 text-sm">
              {t("buyProductForm.note")}
              <Input
                maxLength={5000}
                disabled={saving}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setPaying(null)}
              >
                {t("buyHistory.cancel")}
              </Button>
              <Button
                permission="inventory.purchases.pay"
                type="submit"
                disabled={saving}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {t(saving ? "buyHistory.processing" : "buyDebts.recordPayment")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
