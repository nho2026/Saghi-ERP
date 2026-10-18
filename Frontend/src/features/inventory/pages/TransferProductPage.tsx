import { ProductSelect } from "../components/ProductSelect";
import { randomId } from "@/shared/lib/random-id";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
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
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
import { inventoryApi, type RecordItem } from "../api/inventory.api";
type Line = {
  id: string;
  productId: string;
  fromWarehouseId: string;
  quantity: string;
};
const emptyLine = (): Line => ({
  id: randomId(),
  productId: "",
  fromWarehouseId: "",
  quantity: "",
});
export default function TransferProductPage() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    fromWarehouseId: "",
    toWarehouseId: "",
    from: "",
    to: "",
  });
  const filter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const invalidRange = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );
  const lock = useRef(false);
  const canManage = hasPermission(storedUser(), "inventory.transfers.create");
  const [selectedProducts, setSelectedProducts] = useState<RecordItem[]>([]);
  const resources = useApiResource(
    useCallback(async () => {
      const [warehouses, stock] = await Promise.all([
        inventoryApi.all("warehouses"),
        inventoryApi.all("stock"),
      ]);
      return {
        warehouses,
        stock,
      };
    }, []),
  );
  const history = useApiResource(
    useCallback(() => {
      if (invalidRange)
        return Promise.resolve({
          items: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
        });
      const end = filters.to ? new Date(`${filters.to}T00:00:00`) : null;
      if (end) end.setDate(end.getDate() + 1);
      return inventoryApi.list("transfers", page, {
        pageSize: "10",
        search: filters.search,
        fromWarehouseId: filters.fromWarehouseId,
        toWarehouseId: filters.toWarehouseId,
        startAt: filters.from
          ? new Date(`${filters.from}T00:00:00`).toISOString()
          : "",
        endAt: end?.toISOString() ?? "",
      });
    }, [page, filters, invalidRange]),
  );
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const change = (id: string, patch: Partial<Line>) => {
    setSuccess(false);
    setLines((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };
  const selector = (
    value: string,
    onChange: (value: string) => void,
    items: RecordItem[],
    label: string,
    disabled = false,
  ) => (
    <Select value={value} onValueChange={onChange} disabled={disabled || busy}>
      <SelectTrigger className="h-10 w-full min-w-40" aria-label={label}>
        <SelectValue placeholder={t("transferForm.select")} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current || !canManage) return;
    setError("");
    setSuccess(false);
    if (
      !destination ||
      !lines.length ||
      lines.some(
        (line) =>
          !line.productId ||
          !line.fromWarehouseId ||
          line.fromWarehouseId === destination ||
          !Number.isFinite(Number(line.quantity)) ||
          Number(line.quantity) <= 0,
      )
    ) {
      setError(t("transferForm.invalid"));
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      await inventoryApi.create("transfers", {
        toWarehouseId: destination,
        items: lines.map((line) => ({
          productId: line.productId,
          fromWarehouseId: line.fromWarehouseId,
          quantity: Number(line.quantity),
        })),
      });
      setLines([emptyLine()]);
      setSuccess(true);
      setOpen(false);
      setPage(1);
      await Promise.all([resources.refresh(), history.refresh()]);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6" dir={i18n.dir()}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {t("warehouseModule.transferProduct")}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            permission="create"
            disabled={!canManage || busy}
            onClick={() => {
              setError("");
              setSuccess(false);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t("transferForm.newTransfer")}
          </Button>
        </div>
      </div>
      {(error || resources.error || history.error) && (
        <p role="alert" className="text-sm text-destructive">
          {error || resources.error || history.error}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-lg bg-primary/10 p-3 text-primary">
          {t("transferForm.saved")}
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!lock.current) setOpen(value);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[85vh] overflow-y-auto sm:max-w-[min(96vw,1200px)]"
        >
          <DialogHeader>
            <DialogTitle>{t("transferForm.newTransfer")}</DialogTitle>
          </DialogHeader>
          {(error || resources.error) && (
            <p role="alert" className="text-sm text-destructive">
              {error || resources.error}
            </p>
          )}
          <form onSubmit={submit} className="space-y-5">
            <fieldset
              disabled={busy || !canManage || resources.isLoading}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex w-full flex-col gap-2 sm:w-80">
                  <Label>{t("transferForm.to")}</Label>
                  {selector(
                    destination,
                    (value) => {
                      setDestination(value);
                      setLines((items) =>
                        items.map((item) =>
                          item.fromWarehouseId === value
                            ? { ...item, fromWarehouseId: "" }
                            : item,
                        ),
                      );
                      setSuccess(false);
                    },
                    resources.data?.warehouses ?? [],
                    t("transferForm.to"),
                  )}
                </div>
                <Button
                  type="button"
                  className="h-10 shrink-0"
                  disabled={lines.length >= 100}
                  onClick={() => setLines((items) => [...items, emptyLine()])}
                >
                  <Plus className="size-4" />
                  {t("buyProductForm.addItem")}
                </Button>
                <Button
                  type="button"
                  className="h-10 shrink-0"
                  variant="outline"
                  onClick={() => {
                    setLines([emptyLine()]);
                    setDestination("");
                    setError("");
                    setSuccess(false);
                  }}
                >
                  {t("buyProductForm.clear")}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "product",
                      "from",
                      "available",
                      "quantity",
                      "threshold",
                      "price",
                      "specialPrice",
                      "actions",
                    ].map((key) => (
                      <TableHead key={key}>
                        {t(`transferForm.${key}`)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {lines.map((line) => {
                    const product = selectedProducts.find(
                      (p) => p.id === line.productId,
                    );
                    const stock = resources.data?.stock.find(
                      (s) =>
                        s.productId === line.productId &&
                        s.warehouseId === line.fromWarehouseId,
                    );
                    const sources =
                      resources.data?.warehouses.filter(
                        (w) =>
                          w.id !== destination &&
                          resources.data?.stock.some(
                            (s) =>
                              s.productId === line.productId &&
                              s.warehouseId === w.id &&
                              s.quantity > 0,
                          ),
                      ) ?? [];
                    return (
                      <TableRow key={line.id}>
                        <TableCell className="w-[300px] min-w-[300px]">
                          <ProductSelect
                            selected={product}
                            disabled={busy}
                            onChange={(product) => {
                              setSelectedProducts((items) => [
                                ...items.filter(
                                  (item) => item.id !== product.id,
                                ),
                                product,
                              ]);
                              change(line.id, {
                                productId: product.id,
                                fromWarehouseId: "",
                                quantity: "",
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {selector(
                            line.fromWarehouseId,
                            (fromWarehouseId) =>
                              change(line.id, { fromWarehouseId }),
                            sources,
                            t("transferForm.from"),
                            !line.productId,
                          )}
                        </TableCell>
                        <TableCell>
                          {stock
                            ? `${stock.quantity} ${product?.unit ?? ""}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-32"
                            aria-label={t("transferForm.quantity")}
                            type="number"
                            min="0.001"
                            step="0.001"
                            max={Math.min(stock?.quantity ?? 1000000, 1000000)}
                            required
                            value={line.quantity}
                            onChange={(event) =>
                              change(line.id, { quantity: event.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>{stock?.reorderLevel ?? "—"}</TableCell>
                        <TableCell>
                          {product ? money(product.sellingPrice) : "—"}
                        </TableCell>
                        <TableCell>
                          {product ? money(product.specialPrice) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              permission="view"
                              data-action="delete"
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              aria-label={t("buyProductForm.remove")}
                              onClick={() =>
                                setLines((items) =>
                                  items.filter((item) => item.id !== line.id),
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <DialogFooter>
                <Button
                  type="button"
                  className="h-10 shrink-0"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  permission="create"
                  type="submit"
                  disabled={!lines.length || busy}
                >
                  {t(busy ? "buyHistory.processing" : "orderForm.submit")}
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5">
          <h2 className="font-semibold">{t("transferForm.latest")}</h2>
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="size-4" />
            {t("inventory.filters")}
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent
            dir={i18n.dir()}
            className="max-h-[85dvh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                {t("inventory.filters")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transfer-search">
                  {t("transferForm.searchHistory")}
                </Label>
                <Input
                  id="transfer-search"
                  value={filters.search}
                  onChange={(event) => filter("search", event.target.value)}
                  placeholder={t("transferForm.searchHistory")}
                />
              </div>
              {(["fromWarehouseId", "toWarehouseId"] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <Label>
                    {t(
                      key === "fromWarehouseId"
                        ? "transferForm.from"
                        : "transferForm.to",
                    )}
                  </Label>
                  {selector(
                    filters[key] || "all",
                    (value) => filter(key, value === "all" ? "" : value),
                    [
                      { id: "all", name: t("incomeExpenses.all") },
                      ...(resources.data?.warehouses ?? []),
                    ],
                    t(
                      key === "fromWarehouseId"
                        ? "transferForm.from"
                        : "transferForm.to",
                    ),
                  )}
                </div>
              ))}
              <div className="space-y-2">
                <Label>{t("incomeExpenses.from")}</Label>
                <FormDatePicker
                  value={filters.from}
                  onValueChange={(value) => filter("from", value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("incomeExpenses.to")}</Label>
                <FormDatePicker
                  value={filters.to}
                  onValueChange={(value) => filter("to", value)}
                />
              </div>
            </div>
            {invalidRange && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {t("transferForm.invalidDateRange")}
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: "",
                    fromWarehouseId: "",
                    toWarehouseId: "",
                    from: "",
                    to: "",
                  });
                  setPage(1);
                }}
              >
                {t("inventory.clearFilters")}
              </Button>
              <Button
                disabled={invalidRange}
                onClick={() => setFilterOpen(false)}
              >
                {t("incomeExpenses.done")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Table>
          <TableHeader>
            <TableRow>
              {["date", "product", "from", "to", "quantity"].map((key) => (
                <TableHead key={key}>{t(`transferForm.${key}`)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {history.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : history.data?.items.length ? (
              history.data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.occurredAt).toLocaleString(i18n.language)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.product?.name}
                  </TableCell>
                  <TableCell>{item.warehouse?.name}</TableCell>
                  <TableCell>{item.toWarehouse?.name ?? "—"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("transferForm.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t p-4 text-sm">
          <span>
            {page} / {history.data?.pagination.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || history.isLoading}
              onClick={() => setPage((value) => value - 1)}
            >
              {t("transferForm.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                history.isLoading ||
                page >= (history.data?.pagination.totalPages ?? 1)
              }
              onClick={() => setPage((value) => value + 1)}
            >
              {t("transferForm.next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
