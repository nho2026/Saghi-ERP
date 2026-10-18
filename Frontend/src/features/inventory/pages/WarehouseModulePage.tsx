import { Card } from "@/shared/components/ui/card";
import { Warehouse } from "lucide-react";
import { useTranslation } from "react-i18next";
import { warehousePages } from "../warehouse-pages";

export default function WarehouseModulePage({
  page,
}: {
  page: (typeof warehousePages)[number];
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("warehouseModule.title")}
          {page.section && ` / ${t(`warehouseModule.${page.section}`)}`}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{t(page.label)}</h1>
      </div>
      <Card className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center">
        <Warehouse className="mb-4 size-10 text-primary" />
        <h2 className="font-semibold">{t("warehouseModule.pending")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("warehouseModule.moduleDescription")}
        </p>
      </Card>
    </div>
  );
}
