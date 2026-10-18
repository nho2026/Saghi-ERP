import axios from "axios";
import { purchaseInvoiceHtml } from "../lib/purchase-invoice";
import type { Settings } from "@/features/settings/settings";
import {
  PurchaseFilters,
  type PurchaseExtraFilters,
} from "../components/PurchaseFilters";
import { BuyProductForm } from "../components/BuyProductForm";
import type { ReactNode } from "react";
import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";
import { useCallback, useDeferredValue, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CircleAlert,
  Eye,
  Pencil,
  Printer,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import { productImageUrl } from "../api/inventory.api";

type Purchase = {
  id: string;
  invoiceNumber: string;
  retailer: string;
  buyDate: string;
  salesperson: string;
  note: string;
  totalPrice: string;
  isDebt: boolean;
  status: string;
  hasInvoice: boolean;
  attachmentUrl: string | null;
  items: {
    productId: string;
    warehouseId: string;
    productName: string;
    unit?: string;
    warehouseName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
};
const columns = [
  "invoiceNumber",
  "retailer",
  "totalProducts",
  "hasInvoice",
  "note",
  "totalPrice",
] as const;
type Column = (typeof columns)[number];
export default function BuyHistoryPage({
  title = "warehouseModule.buyHistory",
  headerAction,
}: { title?: string; headerAction?: ReactNode } = {}) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("search") ?? "",
  );
  const [extraFilters, setExtraFilters] = useState<PurchaseExtraFilters>({});
  const [hasInvoice, setHasInvoice] = useState("");
  const [retailer, setRetailer] = useState("");
  const [page, setPage] = useState(1);
  const query = useDeferredValue(search);
  const visible: Column[] = [...columns];
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const canEdit = hasPermission(storedUser(), "inventory.purchases.update");
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [action, setAction] = useState<{
    purchase: Purchase;
    kind: "return" | "delete";
  } | null>(null);
  const [returnPassword, setReturnPassword] = useState("");
  const [stockConflict, setStockConflict] = useState<{
    product: string;
    warehouse: string;
    required: number;
    available: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const canReturn = hasPermission(storedUser(), "inventory.purchases.return");
  const canDelete = hasPermission(storedUser(), "inventory.purchases.delete");
  const result = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<{
            items: Purchase[];
            pagination: { total: number; totalPages: number };
          }>("/inventory/purchases", {
            params: {
              ...extraFilters,
              page,
              pageSize: 10,
              search: query,
              retailer,
              hasInvoice,
            },
          })
          .then((r) => r.data),
      [page, query, retailer, hasInvoice, extraFilters],
    ),
  );
  const money = (value: string | number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  const label = (column: Column) =>
    t(
      column === "hasInvoice"
        ? "buyHistory.invoiceFilter"
        : column === "totalProducts"
          ? "buyHistory.totalProducts"
          : `buyProductForm.${column}`,
    );
  const value = (row: Purchase, column: Column) =>
    column === "hasInvoice"
      ? t(
          row.hasInvoice
            ? "buyHistory.withInvoice"
            : "buyHistory.withoutInvoice",
        )
      : column === "totalProducts"
        ? row.items.length
        : column === "totalPrice"
          ? money(row.totalPrice)
          : row[column] || "—";
  const print = async (row: Purchase) => {
    const target = window.open("", "_blank", "width=1000,height=800");
    if (!target) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    target.opener = null;
    target.document.body.textContent = t("resourceState.loading");
    try {
      const { data } = await apiClient.get<Settings>("/settings/runtime");
      if (target.closed) return;
      target.document.open();
      target.document.write(
        purchaseInvoiceHtml(
          row,
          data.organization,
          t,
          i18n.language,
          i18n.dir(),
        ),
      );
      target.document.close();
      await Promise.all(
        Array.from(target.document.images).map((image) => image.decode()),
      );
      await target.document.fonts.ready;
      if (target.closed) return;
      target.focus();
      target.print();
    } catch (cause) {
      if (!target.closed) target.close();
      setError(apiErrorMessage(cause));
    }
  };
  const confirm = async () => {
    if (!action || lock.current || !returnPassword) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setStockConflict(null);
    try {
      if (action.kind === "return")
        await apiClient.post(
          `/inventory/purchases/${action.purchase.id}/return`,
          { password: returnPassword },
        );
      else
        await apiClient.delete(`/inventory/purchases/${action.purchase.id}`, {
          data: { password: returnPassword },
        });
      setReturnPassword("");
      setAction(null);
      if (
        action.kind === "delete" &&
        result.data?.items.length === 1 &&
        page > 1
      )
        setPage((p) => p - 1);
      else await result.refresh();
    } catch (cause) {
      if (
        axios.isAxiosError(cause) &&
        cause.response?.data?.code === "PURCHASE_INSUFFICIENT_STOCK"
      ) {
        setStockConflict(cause.response.data.details);
        setReturnPassword("");
      } else {
        setError(apiErrorMessage(cause));
      }
    } finally {
      setBusy(false);
      lock.current = false;
    }
  };
  return (
    <div className="space-y-4 pb-8">
      <header className="flex items-center gap-3 border-b pb-4">
        <h1 className="text-xl font-semibold">{t(title)}</h1>

        {headerAction}
      </header>
      {(result.error || (error && !action)) && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {result.error || error}
        </p>
      )}
      <Card className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap gap-3 p-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-s-3 top-3 size-4 text-muted-foreground" />
            <Input
              className="ps-9"
              aria-label={t("buyHistory.search")}
              placeholder={t("buyHistory.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <PurchaseFilters
            value={{ ...extraFilters, retailer, hasInvoice }}
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
              setPage(1);
            }}
          />
          <div className="ms-auto"></div>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader className="border-b text-xs text-muted-foreground">
              <TableRow>
                {columns
                  .filter((column) => visible.includes(column))
                  .map((column) => (
                    <TableHead
                      key={column}
                      className="px-4 py-3 text-start font-medium"
                    >
                      {label(column)}
                    </TableHead>
                  ))}
                <TableHead className="px-4 py-3">
                  <span className="sr-only">{t("buyHistory.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {result.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={visible.length + 1}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {t("resourceState.loading")}
                  </TableCell>
                </TableRow>
              ) : result.error ? (
                <TableRow>
                  <TableCell
                    colSpan={visible.length + 1}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {t("warehouseDashboard.unavailable")}
                  </TableCell>
                </TableRow>
              ) : !result.data?.items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={visible.length + 1}
                    className="p-12 text-center text-muted-foreground"
                  >
                    {t("buyHistory.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                result.data.items.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b transition hover:bg-muted/30"
                  >
                    {columns
                      .filter((column) => visible.includes(column))
                      .map((column) => (
                        <TableCell
                          key={column}
                          className={`px-4 py-3 ${column === "note" ? "max-w-64 whitespace-pre-wrap break-words" : ""}`}
                        >
                          {value(row, column)}
                          {column === "invoiceNumber" &&
                            row.status === "returned" && (
                              <span className="ms-2 rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
                                {t("buyHistory.returned")}
                              </span>
                            )}
                        </TableCell>
                      ))}
                    <TableCell className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        {[
                          {
                            icon: Printer,
                            label: "print",
                            onClick: () => print(row),
                            color: "bg-primary text-white hover:bg-primary/90",
                            disabled: false,
                          },
                          {
                            icon: Eye,
                            label: "view",
                            onClick: () => setSelected(row),
                            color: "border bg-background hover:bg-muted",
                            disabled: false,
                          },
                          ...(canEdit
                            ? [
                                {
                                  icon: Pencil,
                                  label: "edit",
                                  onClick: () => setEditing(row),
                                  color: "border bg-background hover:bg-muted",
                                  disabled: row.status !== "completed",
                                },
                              ]
                            : []),
                          ...(canReturn
                            ? [
                                {
                                  icon: RotateCcw,
                                  label: "return",
                                  onClick: () => {
                                    if (row.hasInvoice && !row.attachmentUrl) {
                                      setError(
                                        t("buyProductForm.attachmentRequired"),
                                      );
                                      return;
                                    }
                                    setError("");
                                    setStockConflict(null);
                                    setReturnPassword("");
                                    setAction({
                                      purchase: row,
                                      kind: "return",
                                    });
                                  },
                                  color:
                                    "bg-primary text-white hover:bg-primary/90",
                                  disabled: row.status !== "completed",
                                },
                              ]
                            : []),
                          ...(canDelete
                            ? [
                                {
                                  icon: Trash2,
                                  label: "delete",
                                  onClick: () => {
                                    if (
                                      row.hasInvoice !== false &&
                                      !row.attachmentUrl
                                    ) {
                                      setError(
                                        t("buyProductForm.attachmentRequired"),
                                      );
                                      return;
                                    }
                                    setError("");
                                    setStockConflict(null);
                                    setReturnPassword("");
                                    setAction({
                                      purchase: row,
                                      kind: "delete",
                                    });
                                  },
                                  color:
                                    "bg-red-500 text-white hover:bg-red-600",
                                  disabled: false,
                                },
                              ]
                            : []),
                        ].map(
                          ({
                            icon: Icon,
                            label: key,
                            onClick,
                            color,
                            disabled,
                          }) => (
                            <Button
                              permission={key === "edit" ? "update" : key}
                              data-action={
                                key === "delete" ? "delete" : undefined
                              }
                              key={key}
                              variant="ghost"
                              size="icon"
                              className={`size-8 rounded-md ${color}`}
                              disabled={disabled}
                              title={t(`buyHistory.${key}`)}
                              aria-label={`${t(`buyHistory.${key}`)} ${row.invoiceNumber}`}
                              onClick={onClick}
                            >
                              <Icon className="size-3.5" />
                            </Button>
                          ),
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs text-muted-foreground">
          <span>
            {t("buyHistory.pagination", {
              page,
              pages: result.data?.pagination.totalPages ?? 1,
              total: result.data?.pagination.total ?? 0,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || result.isLoading}
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
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !editBusy) setEditing(null);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1200px)]"
        >
          <DialogHeader className="shrink-0 px-6 py-5">
            <DialogTitle>
              {t("buyHistory.edit")} · {editing?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <BuyProductForm
              key={editing.id}
              purchase={editing}
              onBusy={setEditBusy}
              onSaved={() => {
                setEditing(null);
                void result.refresh();
              }}
            />
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
              <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
                <p>
                  {t("buyProductForm.buyDate")}:{" "}
                  {new Date(selected.buyDate).toLocaleDateString(i18n.language)}
                </p>
                <p>
                  {t("buyProductForm.salesperson")}:{" "}
                  {selected.salesperson || "—"}
                </p>
                <p>
                  {t(selected.isDebt ? "buyHistory.debt" : "buyHistory.paid")}
                </p>
                <p>{t(`buyHistory.${selected.status}`)}</p>
              </div>
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
                    {selected.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="border-b p-2">
                          {item.productName}
                        </TableCell>
                        <TableCell className="border-b p-2">
                          {item.warehouseName}
                        </TableCell>
                        <TableCell className="border-b p-2">
                          {item.quantity} {item.unit ?? ""}
                        </TableCell>
                        <TableCell className="border-b p-2">
                          {money(item.price)}
                        </TableCell>
                        <TableCell className="border-b p-2">
                          {money(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="whitespace-pre-wrap text-sm">
                {selected.note || "—"}
              </p>
              <p className="text-end font-semibold">
                {t("buyProductForm.totalPrice")}: {money(selected.totalPrice)}
              </p>
              {selected.attachmentUrl && (
                <a
                  href={productImageUrl(selected.attachmentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  {t("buyProductForm.attachment")}
                </a>
              )}
              <Button
                permission="print"
                onClick={() => print(selected)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Printer className="size-4" />
                {t("buyHistory.print")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setReturnPassword("");
            setAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                action?.kind === "return"
                  ? "buyHistory.returnTitle"
                  : "buyHistory.deleteTitle",
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                action?.kind === "return"
                  ? "buyHistory.returnDescription"
                  : "buyHistory.deleteDescription",
                { invoice: action?.purchase.invoiceNumber },
              )}
            </DialogDescription>
          </DialogHeader>
          {action && !stockConflict && (
            <div className="space-y-2">
              <Label htmlFor="purchase-return-password">
                {t(
                  action?.kind === "return"
                    ? "buyHistory.returnPassword"
                    : "buyHistory.deletePassword",
                )}
              </Label>
              <Input
                id="purchase-return-password"
                type="password"
                autoComplete="current-password"
                value={returnPassword}
                onChange={(event) => setReturnPassword(event.target.value)}
                disabled={busy}
                maxLength={128}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter" && returnPassword && !busy) {
                    event.preventDefault();
                    void confirm();
                  }
                }}
                required
              />
            </div>
          )}
          {stockConflict && (
            <div
              role="alert"
              className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              <div className="flex items-start gap-3">
                <CircleAlert
                  className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">
                    {t("buyHistory.stockBlockedTitle")}
                  </p>
                  <p className="mt-1 text-sm opacity-80">
                    {t("buyHistory.stockBlockedDescription")}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-lg border border-amber-200/60 bg-background/70 p-3 text-sm dark:border-amber-900">
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    {t("buyProductForm.product")}
                  </dt>
                  <dd className="font-medium">{stockConflict.product}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    {t("buyProductForm.storage")}
                  </dt>
                  <dd className="font-medium">{stockConflict.warehouse}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("buyHistory.stockRequired")}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {stockConflict.required.toLocaleString(i18n.language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("buyHistory.stockAvailable")}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
                    {stockConflict.available.toLocaleString(i18n.language)}
                  </dd>
                </div>
              </dl>
              <p className="text-sm">{t("buyHistory.stockBlockedHelp")}</p>
              <p className="text-xs font-medium">
                {t("buyHistory.noChangesSaved")}
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setReturnPassword("");
                setAction(null);
              }}
            >
              {t(stockConflict ? "buyHistory.closeAlert" : "buyHistory.cancel")}
            </Button>
            {!stockConflict && (
              <Button
                permission={action?.kind === "return" ? "return" : "delete"}
                variant="destructive"
                disabled={busy || !returnPassword}
                onClick={() => void confirm()}
              >
                {t(
                  busy
                    ? "buyHistory.processing"
                    : action?.kind === "return"
                      ? "buyHistory.return"
                      : "buyHistory.delete",
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
