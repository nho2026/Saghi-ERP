import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { SearchableFilter } from "@/shared/components/ui/searchable-filter";
import { inventoryApi } from "../api/inventory.api";

export function StorageQuantityEditor({
  product,
  onSaved,
  initialWarehouseId = "",
}: {
  initialWarehouseId?: string;
  product: { id: string; name: string };
  onSaved: () => Promise<unknown>;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [quantityInput, setQuantity] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const warehouses = useApiResource(
    useCallback(
      () => (open ? inventoryApi.all("warehouses") : Promise.resolve([])),
      [open],
    ),
  );
  const stock = useApiResource(
    useCallback(async () => {
      if (!open || !warehouseId) return null;
      const { data } = await apiClient.get<{ items: { quantity: number }[] }>(
        "/inventory/stock",
        {
          params: { productId: product.id, warehouseId, page: 1, pageSize: 1 },
        },
      );
      return data.items[0]?.quantity ?? 0;
    }, [open, product.id, warehouseId]),
  );
  const quantity =
    quantityInput ?? (stock.data == null ? "" : String(stock.data));
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (
      lock.current ||
      stock.isLoading ||
      stock.error ||
      stock.data == null ||
      !warehouseId ||
      !quantity.trim()
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await inventoryApi.adjust({
        mode: "set",
        productId: product.id,
        warehouseId,
        quantity: Number(quantity),
        expectedQuantity: stock.data,
        notes,
      });
      setOpen(false);
      await onSaved();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="outline"
        permission="inventory.stock.adjust"
        size="icon"
        title={t("productQuantity.title")}
        aria-label={t("productQuantity.title")}
        onClick={() => {
          setError("");
          setWarehouseId(initialWarehouseId);
          setQuantity(null);
          setNotes("");
          setOpen(true);
        }}
      >
        <Package />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!lock.current) setOpen(value);
        }}
      >
        <DialogContent dir={i18n.dir()}>
          <DialogHeader>
            <DialogTitle>{t("productQuantity.title")}</DialogTitle>
            <DialogDescription>
              {product.name} · {t("productQuantity.help")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <fieldset disabled={busy} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("buyProductForm.storage")}</Label>
                <SearchableFilter
                  value={warehouseId}
                  onValueChange={(value) => {
                    setWarehouseId(value);
                    setQuantity(null);
                  }}
                  className="w-full"
                  label={t("buyProductForm.storage")}
                  options={(warehouses.data ?? []).map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("productQuantity.current")}:{" "}
                {stock.isLoading
                  ? t("resourceState.loading")
                  : stock.data == null
                    ? "—"
                    : stock.data.toLocaleString(i18n.language)}
              </p>
              <div className="space-y-2">
                <Label htmlFor="product-new-quantity">
                  {t("productQuantity.new")}
                </Label>
                <Input
                  id="product-new-quantity"
                  type="number"
                  min="0"
                  max="1000000000"
                  step="any"
                  required
                  disabled={!warehouseId || stock.isLoading || !!stock.error}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity-note">{t("orderForm.note")}</Label>
                <Input
                  id="quantity-note"
                  maxLength={5000}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </fieldset>
            {(error || stock.error || warehouses.error) && (
              <p role="alert" className="text-sm text-destructive">
                {error || stock.error || warehouses.error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                permission="inventory.stock.adjust"
                disabled={
                  busy ||
                  stock.isLoading ||
                  !!stock.error ||
                  !warehouseId ||
                  stock.data == null ||
                  !quantity.trim()
                }
              >
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
