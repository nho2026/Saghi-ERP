import { StorageQuantityEditor } from "../components/StorageQuantityEditor";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2, Printer, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { inventoryApi, type RecordItem } from "../api/inventory.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
const columns = [
  "name",
  "size",
  "code",
  "category",
  "buy",
  "sell",
  "profit",
  "quantity",
] as const;
type Column = (typeof columns)[number];
const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export default function StoragePage() {
  const { t, i18n } = useTranslation();
  const options = useApiResource(
    useCallback(async () => {
      const [warehouses, categories] = await Promise.all([
        inventoryApi.all("warehouses"),
        inventoryApi.all("categories"),
      ]);
      return { warehouses, categories };
    }, []),
  );
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(true);
  const [exporting, setExporting] = useState(false);
  const filters = useCallback(
    () => ({
      search,
      ...(warehouse !== "all" && { warehouseId: warehouse }),
      ...(category !== "all" && { categoryId: category }),
      sort: ascending ? "asc" : "desc",
    }),
    [search, warehouse, category, ascending],
  );
  const data = useApiResource(
    useCallback(() => inventoryApi.storage(page, filters()), [page, filters]),
  );
  const visible: Column[] = [...columns];
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "remove">("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canManage = ["update", "delete"].some((action) =>
    hasPermission(storedUser(), `inventory.products.${action}`),
  );
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const rows = data.data?.items ?? [];
  const totalPages = data.data?.pagination.totalPages ?? 1;
  const currentPage = data.data?.pagination.page ?? page;
  const totalRows = data.data?.pagination.total ?? 0;
  const totals = data.data?.totals ?? {
    products: 0,
    quantity: 0,
    buy: 0,
    sell: 0,
  };
  const cell = (p: RecordItem, key: Column) =>
    ({
      name: p.name,
      size: p.size || "—",
      code: p.sku,
      category: p.category?.name || "—",
      buy: money(p.costPrice),
      sell: money(p.sellingPrice),
      profit: money(p.sellingPrice - p.costPrice),
      quantity: `${money(p.quantity)} ${p.unit}`,
    })[key];
  function open(p: RecordItem, action: typeof mode) {
    setSelected({ ...p });
    setMode(action);
    setError("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || busy || !canManage) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "remove") await inventoryApi.remove("products", selected.id);
      else
        await inventoryApi.update("products", selected.id, {
          ...selected,
          costPrice: Number(selected.costPrice),
          sellingPrice: Number(selected.sellingPrice),
        });
      setSelected(null);
      await data.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function exportRows() {
    const first = await inventoryApi.storage(1, {
      ...filters(),
      pageSize: "100",
    });
    const remaining = await Promise.all(
      Array.from({ length: first.pagination.totalPages - 1 }, (_, index) =>
        inventoryApi.storage(index + 2, { ...filters(), pageSize: "100" }),
      ),
    );
    return {
      rows: [...first.items, ...remaining.flatMap((result) => result.items)],
      totals: first.totals,
    };
  }
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    setError("");
    try {
      const { rows } = await exportRows();
      const quote = (value: unknown) => {
        let text = String(value ?? "");
        if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
      };
      const csv = [
        visible.map((key) => t(`storageView.${key}`)),
        ...rows.map((p) => visible.map((key) => cell(p, key))),
      ]
        .map((row) => row.map(quote).join(","))
        .join("\r\n");
      const url = URL.createObjectURL(
        new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "storage.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setExporting(false);
    }
  }
  async function print() {
    if (exporting) return;
    const popup = window.open("", "_blank", "width=1100,height=800");
    if (!popup) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    popup.opener = null;
    setExporting(true);
    setError("");
    try {
      const { rows, totals } = await exportRows();
      popup.document.write(
        `<html dir="${i18n.dir()}"><head><meta charset="utf-8"><title>${escapeHtml(t("warehouseModule.storage"))}</title><style>body{font:12px Arial;padding:24px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ddd;text-align:start}@page{size:A4 landscape}</style></head><body><h1>${escapeHtml(t("warehouseModule.storage"))}</h1><p>${escapeHtml(t("storageView.availableProducts"))}: ${totals.products}</p><p>${escapeHtml(t("storageView.availableQuantity"))}: ${money(totals.quantity)}</p><p>${escapeHtml(t("storageView.valuationHint"))}</p><table><thead><tr>${visible.map((key) => `<th>${escapeHtml(t(`storageView.${key}`))}</th>`).join("")}</tr></thead><tbody>${rows.map((p) => `<tr>${visible.map((key) => `<td>${escapeHtml(cell(p, key))}</td>`).join("")}</tr>`).join("")}</tbody></table>${["buy", "sell", "profit"].map((key) => `<p>${escapeHtml(t(`storageView.total${key}`))}: ${money(key === "buy" ? totals.buy : key === "sell" ? totals.sell : totals.sell - totals.buy)}</p>`).join("")}</body></html>`,
      );
      popup.document.close();
      popup.focus();
      popup.print();
    } catch (cause) {
      popup.close();
      setError(apiErrorMessage(cause));
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="space-y-5" dir={i18n.dir()}>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{t("warehouseModule.storage")}</h1>
      </div>
      {(data.error || options.error || (!selected && error)) && (
        <p role="alert" className="text-destructive">
          {data.error || options.error || error}
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <Input
            className="w-full sm:w-72"
            aria-label={t("storageView.search")}
            placeholder={t("storageView.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {(
            [
              [warehouse, setWarehouse, options.data?.warehouses, "allStorage"],
              [category, setCategory, options.data?.categories, "allCategory"],
            ] as const
          ).map(([value, change, items, key]) => (
            <Select
              key={key}
              value={value}
              onValueChange={(value) => {
                change(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-60"
                aria-label={t(`storageView.${key}`)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t(`storageView.${key}`)}</SelectItem>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        {!data.isLoading && !data.error && (
          <div className="space-y-3 border-t bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {(
                [
                  ["availableProducts", totals.products],
                  ["availableQuantity", totals.quantity],
                  ["totalbuy", totals.buy],
                  ["totalsell", totals.sell],
                  ["totalprofit", totals.sell - totals.buy],
                ] as const
              ).map(([key, value]) => (
                <Card key={key} className="gap-2 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t(`storageView.${key}`)}
                  </p>
                  <p className="text-xl font-semibold tabular-nums">
                    {key === "availableProducts"
                      ? value.toLocaleString(i18n.language)
                      : money(value)}
                  </p>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("storageView.valuationHint")}
            </p>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {visible.map((key) => (
                <TableHead key={key}>
                  {key === "name" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAscending((v) => !v);
                        setPage(1);
                      }}
                    >
                      {t("storageView.name")} {ascending ? "↓" : "↑"}
                    </Button>
                  ) : (
                    t(`storageView.${key}`)
                  )}
                </TableHead>
              ))}
              <TableHead>{t("transferForm.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {data.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={visible.length + 1}
                  className="h-28 text-center"
                >
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((p) => (
                <TableRow key={p.id}>
                  {visible.map((key) => (
                    <TableCell key={key}>{cell(p, key)}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <StorageQuantityEditor
                        product={{ id: p.id, name: String(p.name) }}
                        initialWarehouseId={
                          warehouse === "all" ? "" : warehouse
                        }
                        onSaved={data.refresh}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("storageView.view")}
                        onClick={() => open(p, "view")}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canManage && (
                        <>
                          <Button
                            permission="inventory.products.update"
                            data-action="edit"
                            size="icon"
                            aria-label={t("storageView.edit")}
                            onClick={() => open(p, "edit")}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            permission="inventory.products.delete"
                            data-action="delete"
                            variant="destructive"
                            size="icon"
                            aria-label={t("storageView.remove")}
                            onClick={() => open(p, "remove")}
                          >
                            <Trash2 className="size-4 text-white" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visible.length + 1}
                  className="h-28 text-center"
                >
                  {t("storageView.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <div className="flex gap-2">
            <Button
              permission="print"
              variant="outline"
              disabled={data.isLoading || exporting || !totalRows}
              onClick={print}
            >
              <Printer className="size-4" />
              {t("buyHistory.print")}
            </Button>
            <Button
              permission="export"
              variant="outline"
              disabled={data.isLoading || exporting || !totalRows}
              onClick={exportCsv}
            >
              <Download className="size-4" />
              {t("storageView.export")}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              {currentPage} / {totalPages} · {totalRows}
            </span>
            <Button
              variant="outline"
              disabled={data.isLoading || currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              {t("transferForm.previous")}
            </Button>
            <Button
              variant="outline"
              disabled={data.isLoading || currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              {t("transferForm.next")}
            </Button>
          </div>
        </div>
      </Card>
      <Dialog
        open={!!selected}
        onOpenChange={(value) => {
          if (!value && !busy) setSelected(null);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {t(`storageView.${mode}`)} — {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          {selected &&
            (mode === "view" ? (
              <dl className="grid grid-cols-2 gap-3">
                {columns.map((key) => (
                  <div key={key}>
                    <dt className="text-sm text-muted-foreground">
                      {t(`storageView.${key}`)}
                    </dt>
                    <dd>{cell(selected, key)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <form onSubmit={save} className="space-y-4">
                {mode === "remove" ? (
                  <p>{t("storageView.confirmRemove")}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["name", "name"],
                        ["sku", "code"],
                        ["costPrice", "buy"],
                        ["sellingPrice", "sell"],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={`storage-${field}`}>
                          {t(`storageView.${label}`)}
                        </Label>
                        <Input
                          id={`storage-${field}`}
                          required
                          disabled={busy}
                          type={field.includes("Price") ? "number" : "text"}
                          min={0}
                          step="0.01"
                          value={selected[field]}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              [field]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setSelected(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    permission={
                      mode === "remove"
                        ? "inventory.products.delete"
                        : "inventory.products.update"
                    }
                    disabled={busy}
                    variant={mode === "remove" ? "destructive" : "default"}
                  >
                    {t(
                      busy
                        ? "buyHistory.processing"
                        : mode === "remove"
                          ? "storageView.remove"
                          : "common.save",
                    )}
                  </Button>
                </DialogFooter>
              </form>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
