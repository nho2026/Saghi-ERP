import { Card } from "@/shared/components/ui/card";
import { Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";

type StoragePage = "editSpecialPrice" | "expireSoon" | "threshold";

export default function WarehouseStoragePage({ page }: { page: StoragePage }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("warehouseModule.title")} / {t("warehouseModule.storage")}
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {t(`warehouseModule.${page}`)}
        </h1>
      </div>
      <Card className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center">
        <Boxes className="mb-4 size-10 text-primary" />
        <h2 className="font-semibold">{t("warehouseModule.pending")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("warehouseModule.storageDescription")}
        </p>
      </Card>
    </div>
  );
}
