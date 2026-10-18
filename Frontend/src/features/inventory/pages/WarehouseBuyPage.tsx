import { Card } from "@/shared/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

type BuyPage =
  "buyProduct" | "buyHistory" | "buyDebts" | "order" | "departmentOrders";

export default function WarehouseBuyPage({ page }: { page: BuyPage }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("warehouseModule.title")} / {t("warehouseModule.buy")}
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {t(`warehouseModule.${page}`)}
        </h1>
      </div>
      <Card className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center">
        <ShoppingCart className="mb-4 size-10 text-primary" />
        <h2 className="font-semibold">{t("warehouseModule.pending")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("warehouseModule.description")}
        </p>
      </Card>
    </div>
  );
}
