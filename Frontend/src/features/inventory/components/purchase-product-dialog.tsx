import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { inventoryApi, type RecordItem } from "../api/inventory.api";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { useCallback } from "react";
const units = [
  "item",
  "box",
  "pack",
  "bottle",
  "piece",
  "set",
  "pair",
  "carton",
  "roll",
  "tube",
  "bag",
  "vial",
  "ampoule",
  "kg",
  "g",
  "l",
  "ml",
  "other",
];
export function PurchaseProductDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (product: RecordItem) => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("item");
  const options = useApiResource(
    useCallback(async () => {
      const [categories, brands] = await Promise.all([
        inventoryApi.all("categories"),
        inventoryApi.all("brands"),
      ]);
      return { categories, brands };
    }, []),
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      const { data } = await inventoryApi.create("products", {
        ...fields,
        unit: unit === "other" ? fields.customUnit : unit,
        costPrice: Number(fields.costPrice),
        sellingPrice: Number(fields.sellingPrice),
        status: "active",
      });
      onCreated(data);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        dir={i18n.dir()}
        className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>{t("warehouseModule.addProduct")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-3">
            {["name", "sku", "barcode", "costPrice", "sellingPrice"].map(
              (field) => (
                <Label key={field} className="flex flex-col gap-2">
                  {t(`inventory.fields.${field}`)}
                  <Input
                    name={field}
                    required={field !== "barcode"}
                    minLength={field === "name" ? 2 : undefined}
                    type={field.includes("Price") ? "number" : "text"}
                    min="0"
                    step="0.01"
                    defaultValue={field.includes("Price") ? "0" : ""}
                  />
                </Label>
              ),
            )}
            <Label className="flex flex-col gap-2">
              {t("inventory.fields.unit")}
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`inventory.units.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unit === "other" && (
                <Input
                  name="customUnit"
                  required
                  placeholder={t("inventory.units.other")}
                />
              )}
            </Label>
            {(["categories", "brands"] as const).map((key) => (
              <Label key={key} className="flex flex-col gap-2">
                {t(
                  `inventory.fields.${key === "categories" ? "category" : "brand"}`,
                )}
                <Select name={key === "categories" ? "categoryId" : "brandId"}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.data?.[key].map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>
            ))}
            {(error || options.error) && (
              <p role="alert" className="col-span-full text-destructive">
                {error || options.error}
              </p>
            )}
            <div className="col-span-full flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button permission="inventory.products.create" type="submit">
                {t(busy ? "inventory.saving" : "inventory.save")}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
