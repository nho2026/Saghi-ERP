import { OrderForm } from "../components/OrderForm";
import { hasPagePermission } from "@/features/auth/access";
import type { ReactNode } from "react";
import { useCallback, useDeferredValue, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Printer, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
type Order = {
  id: string;
  name: string;
  note: string;
  createdAt: string;
  totalPrice: string;
  items: {
    isNew: boolean;
    productId: string | null;
    imageUrl?: string | null;
    name: string;
    size: string;
    code: string;
    quantity: number;
    price: number;
    totalPrice: number;
    note: string;
    arrived?: boolean;
  }[];
};
const columns = [
  "name",
  "date",
  "totalProducts",
  "totalPrice",
  "allArrived",
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
export default function OrderHistoryPage({
  title = "warehouseModule.orderHistory",
  headerAction,
}: { title?: string; headerAction?: ReactNode } = {}) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("search") ?? "",
  );
  const query = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const visible: Column[] = [...columns];
  const [editing, setEditing] = useState<Order | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const canEdit = hasPermission(storedUser(), "inventory.orders.update");
  const [selected, setSelected] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
  );
  const result = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<{
            items: Order[];
            pagination: { totalPages: number; total: number };
          }>("/inventory/orders", {
            params: { search: query, page, pageSize: 10 },
          })
          .then((r) => r.data),
      [query, page],
    ),
  );
  const money = (v: string | number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));
  const arrived = (row: Order) =>
    row.items.length > 0 && row.items.every((item) => item.arrived);
  const label = (key: Column) =>
    t(
      key === "name"
        ? "orderForm.name"
        : key === "totalPrice"
          ? "orderForm.totalPrice"
          : key === "date"
            ? "buyDebts.date"
            : key === "totalProducts"
              ? "buyHistory.totalProducts"
              : "orderHistory.allArrived",
    );
  const print = (row: Order) => {
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    win.opener = null;
    win.document.write(
      `<!doctype html><html dir="${i18n.dir()}"><head><meta charset="utf-8"><title>${esc(row.name)}</title><style>body{font:13px Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:start}th{background:#eef8f5}p{white-space:pre-wrap}@page{size:A4 landscape;margin:12mm}</style></head><body><h1>${esc(row.name)}</h1><p>${esc(new Date(row.createdAt).toLocaleString(i18n.language))}</p><p>${esc(row.note)}</p><table><thead><tr>${["product", "size", "code", "quantity", "price", "totalPrice", "note"].map((key) => `<th>${esc(t(`orderForm.${key}`))}</th>`).join("")}<th>${esc(t("orderHistory.arrived"))}</th></tr></thead><tbody>${row.items.map((item) => `<tr><td>${esc(item.name)}</td><td>${esc(item.size)}</td><td>${esc(item.code)}</td><td>${esc(item.quantity)}</td><td>${esc(money(item.price))}</td><td>${esc(money(item.totalPrice))}</td><td>${esc(item.note)}</td><td>${esc(t(item.arrived ? "orderHistory.yes" : "orderHistory.no"))}</td></tr>`).join("")}</tbody></table><h3>${esc(t("orderForm.totalPrice"))}: ${esc(money(row.totalPrice))}</h3><p>${esc(t("orderHistory.allArrived"))}: ${esc(t(arrived(row) ? "orderHistory.yes" : "orderHistory.no"))}</p></body></html>`,
    );
    win.document.close();
    win.focus();
    win.print();
  };
  const changeArrival = async (index: number, value: boolean) => {
    if (!selected || lock.current || !canManage) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await apiClient.patch<Order>(
        `/inventory/orders/${selected.id}/arrival`,
        { index, arrived: value },
      );
      setSelected(response.data);
      await result.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!deleting || lock.current || !canManage) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await apiClient.delete(`/inventory/orders/${deleting.id}`);
      setDeleting(null);
      if (page > 1 && result.data?.items.length === 1) setPage((p) => p - 1);
      else await result.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4 pb-8">
      <header className="flex items-center gap-3 border-b pb-3">
        <h1 className="text-xl font-semibold">{t(title)}</h1>

        {headerAction}
      </header>
      {(result.error || (error && !selected && !deleting)) && (
        <p role="alert" className="text-sm text-destructive">
          {result.error || error}
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-3">
          <Input
            className="max-w-sm"
            value={search}
            placeholder={t("orderHistory.search")}
            aria-label={t("orderHistory.search")}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((key) => visible.includes(key))
                .map((key) => (
                  <TableHead key={key}>{label(key)}</TableHead>
                ))}
              <TableHead>
                <span className="sr-only">{t("orderForm.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {result.isLoading || result.error || !result.data?.items.length ? (
              <TableRow>
                <TableCell
                  colSpan={visible.length + 1}
                  className="h-28 text-center text-muted-foreground"
                >
                  {t(
                    result.isLoading
                      ? "resourceState.loading"
                      : result.error
                        ? "warehouseDashboard.unavailable"
                        : "orderHistory.empty",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              result.data.items.map((row) => (
                <TableRow key={row.id}>
                  {columns
                    .filter((key) => visible.includes(key))
                    .map((key) => (
                      <TableCell key={key}>
                        {key === "allArrived" ? (
                          <Badge
                            className={
                              arrived(row)
                                ? "bg-teal-600 text-white"
                                : "bg-red-500 text-white"
                            }
                          >
                            {t(
                              arrived(row)
                                ? "orderHistory.yes"
                                : "orderHistory.no",
                            )}
                          </Badge>
                        ) : key === "name" ? (
                          row.name
                        ) : key === "date" ? (
                          new Date(row.createdAt).toLocaleString(i18n.language)
                        ) : key === "totalProducts" ? (
                          row.items.length
                        ) : (
                          money(row.totalPrice)
                        )}
                      </TableCell>
                    ))}
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        permission="print"
                        size="icon"
                        className="size-8 bg-teal-500 text-white hover:bg-teal-600"
                        aria-label={`${t("buyHistory.print")} ${row.name}`}
                        onClick={() => print(row)}
                      >
                        <Printer className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="size-8 bg-primary text-primary-foreground hover:bg-primary/90"
                        aria-label={`${t("orderHistory.view")} ${row.name}`}
                        onClick={() => {
                          setError("");
                          setSelected(row);
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          permission="update"
                          size="icon"
                          variant="outline"
                          className="size-8"
                          aria-label={`${t("orderHistory.edit")} ${row.name}`}
                          onClick={() => setEditing(row)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          data-action="delete"
                          size="icon"
                          variant="destructive"
                          className="size-8"
                          aria-label={`${t("buyHistory.delete")} ${row.name}`}
                          onClick={() => {
                            setError("");
                            setDeleting(row);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
          <p className="text-xs text-muted-foreground">
            {t("orderHistory.pagination", {
              page,
              pages: result.data?.pagination.totalPages ?? 1,
              total: result.data?.pagination.total ?? 0,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.isLoading || page <= 1}
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
          className="flex h-[80dvh] max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1200px)]"
        >
          <DialogHeader className="shrink-0 px-6 py-5">
            <DialogTitle>
              {t("orderHistory.edit")} · {editing?.name}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <OrderForm
              key={editing.id}
              order={editing}
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
          if (!open && !busy) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {t("orderHistory.arrivalHint")}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {selected && (
            <>
              <p className="whitespace-pre-wrap text-sm">{selected.note}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "product",
                      "size",
                      "code",
                      "quantity",
                      "price",
                      "totalPrice",
                      "note",
                    ].map((key) => (
                      <TableHead key={key}>{t(`orderForm.${key}`)}</TableHead>
                    ))}
                    <TableHead>{t("orderHistory.arrived")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {selected.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{money(item.price)}</TableCell>
                      <TableCell>{money(item.totalPrice)}</TableCell>
                      <TableCell>{item.note}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={item.arrived === true}
                          disabled={busy || !canManage}
                          aria-label={`${t("orderHistory.arrived")} ${item.name}`}
                          onCheckedChange={(checked) =>
                            void changeArrival(index, checked === true)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-end font-semibold">
                {t("orderForm.totalPrice")}: {money(selected.totalPrice)}
              </p>
              <Button permission="print" onClick={() => print(selected)}>
                <Printer className="size-4" />
                {t("buyHistory.print")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("orderHistory.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("orderHistory.deleteDescription", { name: deleting?.name })}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              {t("buyHistory.cancel")}
            </Button>
            <Button
              permission="delete"
              variant="destructive"
              disabled={busy}
              onClick={() => void remove()}
            >
              {t(busy ? "buyHistory.processing" : "buyHistory.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
