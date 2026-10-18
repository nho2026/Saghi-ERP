import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  TableRow,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";

import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
import { inventoryApi } from "../api/inventory.api";
const empty = {
  productId: "",
  warehouseId: "",
  quantity: "",
  date: "",
  notes: "",
};
const columns = [
  "product",
  "code",
  "size",
  "storage",
  "note",
  "quantity",
  "date",
] as const;
export default function ItemReductionPage() {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`itemReduction.${key}`);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const visible: string[] = ["product", "code", "size", "storage", "note"];
  const canAdjust = hasPermission(
    storedUser(),
    "inventory.item-reductions.create",
  );
  const history = useApiResource(
    useCallback(
      () =>
        inventoryApi.list("item-reductions", page, { search, pageSize: "10" }),
      [page, search],
    ),
  );
  const resources = useApiResource(
    useCallback(async () => {
      const [products, stock] = await Promise.all([
        inventoryApi.all("products"),
        inventoryApi.all("stock"),
      ]);
      return { products: products.filter((p) => p.status === "active"), stock };
    }, []),
  );
  const sources =
    resources.data?.stock.filter(
      (s) => s.productId === form.productId && s.quantity > 0,
    ) ?? [];
  const available =
    sources.find((s) => s.warehouseId === form.warehouseId)?.quantity ?? 0;
  const reset = () => {
    setForm(empty);
    setError("");
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current || !canAdjust) return;
    const quantity = Number(form.quantity);
    if (
      !form.productId ||
      !form.warehouseId ||
      !form.date ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > available
    ) {
      setError(tr("invalid"));
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setSuccess(false);
    try {
      await inventoryApi.create("item-reductions", { ...form, quantity });
      reset();
      setOpen(false);
      setSuccess(true);
      setPage(1);
      await Promise.all([history.refresh(), resources.refresh()]);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <h1 className="text-3xl font-normal sm:text-4xl">{tr("title")}</h1>
      <Button
        permission="create"
        className="bg-teal-600 text-white hover:bg-teal-700"
        disabled={!canAdjust}
        onClick={() => {
          reset();
          setSuccess(false);
          setOpen(true);
        }}
      >
        {tr("add")}
      </Button>
      {(error || history.error || resources.error) && !open && (
        <p role="alert" className="text-destructive">
          {error || history.error || resources.error}
        </p>
      )}
      {success && (
        <p role="status" className="text-teal-600">
          {tr("saved")}
        </p>
      )}
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <Input
            className="sm:max-w-sm"
            value={search}
            aria-label={tr("search")}
            placeholder={tr("search")}
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
                .filter((c) => visible.includes(c))
                .map((c) => (
                  <TableHead key={c}>{tr(c)}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {history.isLoading || !history.data?.items.length ? (
              <TableRow>
                <TableCell
                  colSpan={visible.length}
                  className="h-24 text-center"
                >
                  {history.isLoading
                    ? t("resourceState.loading")
                    : history.error
                      ? tr("loadFailed")
                      : tr("empty")}
                </TableCell>
              </TableRow>
            ) : (
              history.data.items.map((item) => {
                const values = {
                  product: item.product?.name,
                  code: item.product?.sku,
                  size: item.product?.size,
                  storage: item.warehouse?.name,
                  note: item.notes,
                  quantity: Math.abs(item.quantity),
                  date: new Date(item.occurredAt).toLocaleDateString(
                    i18n.language,
                    { timeZone: "UTC" },
                  ),
                };
                return (
                  <TableRow key={item.id}>
                    {columns
                      .filter((c) => visible.includes(c))
                      .map((c) => (
                        <TableCell key={c}>{values[c] || "—"}</TableCell>
                      ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="flex justify-end gap-2 p-4">
          <Button
            size="sm"
            variant="outline"
            disabled={history.isLoading || page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("transferForm.previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={
              history.isLoading ||
              page >= (history.data?.pagination.totalPages ?? 1)
            }
            onClick={() => setPage((p) => p + 1)}
          >
            {t("transferForm.next")}
          </Button>
        </div>
      </Card>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!lock.current) setOpen(value);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
        >
          <DialogHeader>
            <DialogTitle>{tr("addTitle")}</DialogTitle>
            <DialogDescription>{tr("description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit}>
            <fieldset
              disabled={busy || resources.isLoading || !canAdjust}
              className="space-y-5 pt-5"
            >
              <div className="space-y-2">
                <Label htmlFor="reduction-product">{tr("product")}</Label>
                <Select
                  value={form.productId}
                  disabled={busy || resources.isLoading}
                  onValueChange={(productId) =>
                    setForm((f) => ({
                      ...f,
                      productId,
                      warehouseId: "",
                      quantity: "",
                    }))
                  }
                >
                  <SelectTrigger id="reduction-product" className="w-full">
                    <SelectValue placeholder={tr("selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.data?.products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reduction-storage">
                  {tr("productStorage")}
                </Label>
                <Select
                  value={form.warehouseId}
                  disabled={!form.productId || busy || resources.isLoading}
                  onValueChange={(warehouseId) =>
                    setForm((f) => ({ ...f, warehouseId, quantity: "" }))
                  }
                >
                  <SelectTrigger id="reduction-storage" className="w-full">
                    <SelectValue placeholder={tr("selectStorage")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => (
                      <SelectItem key={s.id} value={s.warehouseId}>
                        {s.warehouse?.name} ({s.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.productId && !sources.length && (
                  <p className="text-sm text-muted-foreground">
                    {tr("noStock")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reduction-quantity">{tr("quantity")}</Label>
                <Input
                  id="reduction-quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  max={available}
                  required
                  placeholder={tr("quantity")}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2" role="group" aria-label={tr("date")}>
                <Label>{tr("date")}</Label>
                <FormDatePicker
                  value={form.date}
                  onValueChange={(date) => setForm((f) => ({ ...f, date }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reduction-note">{tr("note")}</Label>
                <Textarea
                  id="reduction-note"
                  className="min-h-[70px]"
                  maxLength={2000}
                  placeholder={tr("note")}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              {(error || resources.error) && (
                <p role="alert" className="text-sm text-destructive">
                  {error || resources.error}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Button type="button" variant="destructive" onClick={reset}>
                  {t("buyProductForm.clear")}
                </Button>
                <Button
                  permission="create"
                  type="submit"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  disabled={busy || !!resources.error || !form.warehouseId}
                >
                  {busy ? t("buyHistory.processing") : tr("create")}
                </Button>
              </div>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
