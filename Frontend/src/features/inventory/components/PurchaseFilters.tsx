import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { InvoiceFilter } from "./InvoiceFilter";
import { RetailerFilter } from "./RetailerFilter";

export type PurchaseExtraFilters = {
  invoiceNumber?: string;
  salesperson?: string;
  fromDate?: string;
  toDate?: string;
  minTotal?: string;
  maxTotal?: string;
  isDebt?: string;
  purchaseStatus?: string;
};
export type PurchaseFilterValues = PurchaseExtraFilters & {
  retailer: string;
  hasInvoice: string;
  status?: string;
};

export function PurchaseFilters({
  value,
  onApply,
}: {
  value: PurchaseFilterValues;
  onApply: (value: PurchaseFilterValues) => void;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const count = Object.values(value).filter(Boolean).length;
  const invalidRange = Boolean(
    (draft.fromDate && draft.toDate && draft.fromDate > draft.toDate) ||
    (draft.minTotal &&
      draft.maxTotal &&
      Number(draft.minTotal) > Number(draft.maxTotal)) ||
    [draft.minTotal, draft.maxTotal].some(
      (amount) =>
        amount && (!Number.isFinite(Number(amount)) || Number(amount) < 0),
    ),
  );
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        <ListFilter className="size-4" />
        {t("inventory.filters")}
        {count > 0 && ` (${count})`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>{t("inventory.filters")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 [&_button[aria-haspopup]]:w-full">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="purchase-filter-invoice">
                {t("buyProductForm.invoiceNumber")}
              </Label>
              <Input
                id="purchase-filter-invoice"
                maxLength={100}
                value={draft.invoiceNumber ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, invoiceNumber: event.target.value })
                }
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="purchase-filter-salesperson">
                {t("buyProductForm.salesperson")}
              </Label>
              <Input
                id="purchase-filter-salesperson"
                maxLength={150}
                value={draft.salesperson ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, salesperson: event.target.value })
                }
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label>{t("buyProductForm.retailer")}</Label>
              <RetailerFilter
                value={draft.retailer}
                onChange={(retailer) => setDraft({ ...draft, retailer })}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label>{t("buyHistory.invoiceFilter")}</Label>
              <InvoiceFilter
                value={draft.hasInvoice}
                onChange={(hasInvoice) => setDraft({ ...draft, hasInvoice })}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label>{t("buyHistory.fromDate")}</Label>
              <FormDatePicker
                name="purchase-filter-from-date"
                value={draft.fromDate ?? ""}
                onValueChange={(fromDate) => setDraft({ ...draft, fromDate })}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label>{t("buyHistory.toDate")}</Label>
              <FormDatePicker
                name="purchase-filter-to-date"
                value={draft.toDate ?? ""}
                onValueChange={(toDate) => setDraft({ ...draft, toDate })}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="purchase-filter-min-total">
                {t("buyHistory.minTotal")}
              </Label>
              <Input
                id="purchase-filter-min-total"
                type="number"
                min="0"
                step="0.01"
                value={draft.minTotal ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, minTotal: event.target.value })
                }
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="purchase-filter-max-total">
                {t("buyHistory.maxTotal")}
              </Label>
              <Input
                id="purchase-filter-max-total"
                type="number"
                min="0"
                step="0.01"
                value={draft.maxTotal ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, maxTotal: event.target.value })
                }
              />
            </div>
            {value.status === undefined && (
              <>
                <div className="flex min-w-0 flex-col gap-2">
                  <Label>{t("buyHistory.paymentType")}</Label>
                  <Select
                    value={draft.isDebt || "all"}
                    onValueChange={(isDebt) =>
                      setDraft({
                        ...draft,
                        isDebt: isDebt === "all" ? "" : isDebt,
                      })
                    }
                  >
                    <SelectTrigger aria-label={t("buyHistory.paymentType")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("buyHistory.allPaymentTypes")}
                      </SelectItem>
                      <SelectItem value="false">
                        {t("buyHistory.paid")}
                      </SelectItem>
                      <SelectItem value="true">
                        {t("buyHistory.debt")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <Label>{t("buyHistory.purchaseStatus")}</Label>
                  <Select
                    value={draft.purchaseStatus || "all"}
                    onValueChange={(purchaseStatus) =>
                      setDraft({
                        ...draft,
                        purchaseStatus:
                          purchaseStatus === "all" ? "" : purchaseStatus,
                      })
                    }
                  >
                    <SelectTrigger aria-label={t("buyHistory.purchaseStatus")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("inventory.allStatuses")}
                      </SelectItem>
                      {["completed", "returned"].map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`buyHistory.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {value.status !== undefined && (
              <div className="flex min-w-0 flex-col gap-2">
                <Label>{t("buyDebts.filterStatus")}</Label>
                <Select
                  value={draft.status || "all"}
                  onValueChange={(status) =>
                    setDraft({
                      ...draft,
                      status: status === "all" ? "" : status,
                    })
                  }
                >
                  <SelectTrigger aria-label={t("buyDebts.filterStatus")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("buyDebts.filterStatus")}
                    </SelectItem>
                    {["paid", "unpaid", "partial"].map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`buyDebts.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {invalidRange && (
            <p role="alert" className="text-sm text-destructive">
              {t("buyHistory.invalidFilterRange")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onApply({
                  retailer: "",
                  hasInvoice: "",
                  ...(value.status !== undefined && { status: "" }),
                });
                setOpen(false);
              }}
            >
              {t("inventory.clearFilters")}
            </Button>
            <Button
              disabled={invalidRange}
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              {t("inventory.applyFilters")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
