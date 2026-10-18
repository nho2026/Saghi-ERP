import { hasPagePermission } from "@/features/auth/access";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { storedUser } from "@/features/auth/access";
const columns = [
  "name",
  "size",
  "code",
  "usd",
  "specialUsd",
  "quantity",
] as const;
export default function SpecialPricesPage() {
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
  const result = useApiResource(
    useCallback(
      () =>
        inventoryApi.list("products", page, {
          pageSize: "10",
          status: "active",
          compact: "true",
          search,
          ...(warehouse !== "all" && { warehouseId: warehouse }),
          ...(category !== "all" && { categoryId: category }),
        }),
      [page, search, warehouse, category],
    ),
  );
  const visible: string[] = [...columns];
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const canEdit = hasPagePermission(storedUser(), "create", "update", "delete");
  const amount = (value: number, currency: string) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  const rows = result.data?.items ?? [];
  const pages = result.data?.pagination.totalPages ?? 1;
  const current = result.data?.pagination.page ?? page;
  const total = result.data?.pagination.total ?? 0;
  const quantity = (p: RecordItem) =>
    (p.stocks ?? [])
      .filter(
        (s: RecordItem) => warehouse === "all" || s.warehouseId === warehouse,
      )
      .reduce((sum: number, s: RecordItem) => sum + Number(s.quantity), 0);
  const cells = (p: RecordItem): Record<string, string> => ({
    name: p.name,
    size: p.size || "—",
    code: p.sku,
    usd: amount(p.sellingPrice, "USD"),
    specialUsd: amount(p.specialPrice, "USD"),
    quantity: `${new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 3 }).format(quantity(p))} ${p.unit}`,
  });
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || lock.current || !canEdit) return;
    setError("");
    const value = Number(price);
    if (
      !price.trim() ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100000000 ||
      Math.abs(value * 100 - Math.round(value * 100)) >= 0.000001
    ) {
      setError(t("specialPrices.invalid"));
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      await inventoryApi.update("products", `${selected.id}/special-price`, {
        specialPrice: value,
      });
      setSelected(null);
      setSaved(true);
      await result.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5" dir={i18n.dir()}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {t("warehouseModule.editSpecialPrice")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("specialPrices.description")}
          </p>
        </div>
      </div>
      {(result.error || options.error) && (
        <p role="alert" className="text-destructive">
          {result.error || options.error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-primary/10 p-3 text-primary">
          {t("specialPrices.saved")}
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 p-4">
          <Input
            className="w-full sm:w-72"
            placeholder={t("storageView.search")}
            aria-label={t("storageView.search")}
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
          ).map(([value, change, items, label]) => (
            <Select
              key={label}
              value={value}
              onValueChange={(v) => {
                change(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-56"
                aria-label={t(`storageView.${label}`)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t(`storageView.${label}`)}</SelectItem>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((k) => visible.includes(k))
                .map((key) => (
                  <TableHead key={key}>{t(`specialPrices.${key}`)}</TableHead>
                ))}
              <TableHead>{t("transferForm.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {result.isLoading || !rows.length ? (
              <TableRow>
                <TableCell
                  colSpan={visible.length + 1}
                  className="h-28 text-center text-muted-foreground"
                >
                  {t(
                    result.isLoading
                      ? "resourceState.loading"
                      : "storageView.empty",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => (
                <TableRow key={p.id}>
                  {columns
                    .filter((k) => visible.includes(k))
                    .map((key) => (
                      <TableCell
                        key={key}
                        className={
                          key.startsWith("special")
                            ? "font-semibold text-primary"
                            : ""
                        }
                      >
                        {cells(p)[key]}
                      </TableCell>
                    ))}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        data-action="edit"
                        variant="outline"
                        size="icon"
                        disabled={!canEdit}
                        aria-label={`${t("warehouseModule.editSpecialPrice")} ${p.name}`}
                        onClick={() => {
                          setSelected(p);
                          setPrice(String(p.specialPrice));
                          setError("");
                          setSaved(false);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t p-4">
          <span className="text-sm text-muted-foreground">
            {current} / {pages} · {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={result.isLoading || current <= 1}
              onClick={() => setPage(current - 1)}
            >
              {t("transferForm.previous")}
            </Button>
            <Button
              variant="outline"
              disabled={result.isLoading || current >= pages}
              onClick={() => setPage(current + 1)}
            >
              {t("transferForm.next")}
            </Button>
          </div>
        </div>
      </Card>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !lock.current) setSelected(null);
        }}
      >
        <DialogContent dir={i18n.dir()}>
          <DialogHeader>
            <DialogTitle>{t("warehouseModule.editSpecialPrice")}</DialogTitle>
            <DialogDescription>
              {selected?.name} · {selected?.sku}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              {t("specialPrices.usd")}:{" "}
              {amount(selected?.sellingPrice ?? 0, "USD")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-price">
                {t("specialPrices.specialUsd")}
              </Label>
              <Input
                id="special-price"
                autoFocus
                required
                type="number"
                min="0"
                max="100000000"
                step="0.01"
                disabled={busy}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("specialPrices.scope")}
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setSelected(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button permission="update" disabled={busy || !canEdit}>
                {t(busy ? "buyHistory.processing" : "common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
