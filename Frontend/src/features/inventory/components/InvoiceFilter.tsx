import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";

export function InvoiceFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Select
      value={value || "all"}
      onValueChange={(next) => onChange(next === "all" ? "" : next)}
    >
      <SelectTrigger
        className="w-full"
        aria-label={t("buyHistory.invoiceFilter")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("buyHistory.allInvoices")}</SelectItem>
        <SelectItem value="true">{t("buyHistory.withInvoice")}</SelectItem>
        <SelectItem value="false">{t("buyHistory.withoutInvoice")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
