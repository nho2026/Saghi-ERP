import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const amounts = {
  subtotal: "subtotal",
  discountAmount: "discount",
  taxAmount: "tax",
  totalAmount: "total",
  paidAmount: "paid",
  changeAmount: "change",
};
export function SaleFilters({
  value,
  onApply,
  warehouses,
}: {
  value: Record<string, string>;
  onApply: (value: Record<string, string>) => void;
  warehouses: { id: string; name: string }[];
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const set = (key: string, next: string) =>
    setDraft((previous) => ({ ...previous, [key]: next }));
  const count = Object.values(value).filter(Boolean).length;
  const invalid =
    Boolean(draft.fromDate && draft.toDate && draft.fromDate > draft.toDate) ||
    Object.keys(amounts).some((field) => {
      const min = draft[`min_${field}`],
        max = draft[`max_${field}`];
      return (
        (min && max && Number(min) > Number(max)) ||
        [min, max].some(
          (amount) =>
            amount && (!Number.isFinite(Number(amount)) || Number(amount) < 0),
        )
      );
    });
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        <ListFilter />
        {t("inventory.filters")}
        {count > 0 && ` (${count})`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>{t("inventory.filters")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!invalid) {
                onApply(draft);
                setOpen(false);
              }
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2 [&_button[aria-haspopup]]:w-full">
              {Object.entries({
                saleNumber: "pos.fields.saleNumber",
                cashierName: "pos.fields.cashier",
                customerName: "pos.customerDetails",
                product: "pos.searchProducts",
                notes: "saleFilters.notes",
              }).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`sale-filter-${key}`}>{t(label)}</Label>
                  <Input
                    id={`sale-filter-${key}`}
                    maxLength={200}
                    value={draft[key] ?? ""}
                    onChange={(event) => set(key, event.target.value)}
                  />
                </div>
              ))}
              {[
                {
                  key: "warehouseId",
                  label: "pos.fields.warehouse",
                  options: warehouses.map((warehouse) => ({
                    value: warehouse.id,
                    label: warehouse.name,
                  })),
                },
                {
                  key: "paymentMethod",
                  label: "pos.fields.payment",
                  options: ["cash", "card", "bank_transfer"].map((value) => ({
                    value,
                    label: t(`pos.values.${value}`),
                  })),
                },
                {
                  key: "status",
                  label: "pos.fields.status",
                  options: ["completed", "cancelled"].map((value) => ({
                    value,
                    label: t(`pos.values.${value}`),
                  })),
                },
              ].map(({ key, label, options }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`sale-filter-${key}`}>{t(label)}</Label>
                  <Select
                    value={draft[key] || "all"}
                    onValueChange={(value) =>
                      set(key, value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger id={`sale-filter-${key}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("saleFilters.all")}
                      </SelectItem>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {["fromDate", "toDate"].map((key) => (
                <div
                  key={key}
                  role="group"
                  aria-label={t(`buyHistory.${key}`)}
                  className="space-y-2"
                >
                  <Label>{t(`buyHistory.${key}`)}</Label>
                  <FormDatePicker
                    name={`sale-filter-${key}`}
                    value={draft[key] ?? ""}
                    onValueChange={(value) => set(key, value)}
                  />
                </div>
              ))}
              {Object.entries(amounts).map(([field, label]) => (
                <fieldset key={field} className="space-y-2">
                  <legend className="text-sm font-medium">
                    {t(`pos.${label}`)}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {["min", "max"].map((bound) => (
                      <div key={bound} className="space-y-1">
                        <Label htmlFor={`sale-filter-${bound}-${field}`}>
                          {t(`saleFilters.${bound}`)}
                        </Label>
                        <Input
                          id={`sale-filter-${bound}-${field}`}
                          type="number"
                          min="0"
                          step="any"
                          value={draft[`${bound}_${field}`] ?? ""}
                          onChange={(event) =>
                            set(`${bound}_${field}`, event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            {invalid && (
              <p role="alert" className="text-sm text-destructive">
                {t("buyHistory.invalidFilterRange")}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onApply({});
                  setOpen(false);
                }}
              >
                {t("inventory.clearFilters")}
              </Button>
              <Button type="submit" disabled={invalid}>
                {t("inventory.applyFilters")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
