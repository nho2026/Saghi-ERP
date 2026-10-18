import { useServerTable } from "@/shared/hooks/useServerTable";
import type { RecordItem } from "../api/inventory.api";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
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
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Boxes,
  Warehouse,
  Package,
  TriangleAlert,
  ShoppingCart,
  HeartPulse,
  Settings,
  ChartNoAxesCombined,
  ArrowRight,
} from "lucide-react";
import { inventoryApi } from "../api/inventory.api";
import { hasPermission, storedUser } from "@/features/auth/access";
import { useApiResource } from "@/shared/hooks/useApiResource";

export default function WarehouseDashboardPage() {
  const { t, i18n } = useTranslation();
  const canStock = hasPermission(storedUser(), "inventory.stock.view");
  const canProducts = hasPermission(storedUser(), "inventory.products.view");
  const canMovements = hasPermission(storedUser(), "inventory.movements.view");
  const [location, setLocation] = useState("all");
  const resource = useApiResource(
    useCallback(async () => {
      const [warehouses, stock, products, movements] = await Promise.all([
        inventoryApi.all("warehouses"),
        canStock ? inventoryApi.stockSummary() : Promise.resolve(null),
        canProducts
          ? inventoryApi.list("products", 1, { pageSize: "1" })
          : Promise.resolve(null),
        canMovements
          ? inventoryApi.list("movements", 1, { pageSize: "6" })
          : Promise.resolve(null),
      ]);
      return { warehouses, stock, products, movements };
    }, [canStock, canProducts, canMovements]),
  );
  const alertTable = useServerTable<RecordItem>(
    "/inventory/stock",
    { onlyLow: "true", warehouseId: location === "all" ? undefined : location },
    canStock,
    5,
  );
  const d = resource.data;
  const number = (value: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(
      value,
    );
  const rows =
    d?.stock?.filter(
      (row) => location === "all" || row.warehouseId === location,
    ) ?? [];
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const units = rows.reduce((sum, row) => sum + row.units, 0);
  const empty = rows.reduce((sum, row) => sum + row.empty, 0);
  const low = rows.reduce((sum, row) => sum + row.low, 0);
  const healthy = total - empty - low;
  const alerts = empty + low;
  const quickLinks = [
    {
      label: "buy",
      description: "buyHint",
      to: "/warehouses/buy/product",
      icon: ShoppingCart,
      permission: "inventory.warehouses.view",
    },
    {
      label: "product",
      description: "productHint",
      to: "/inventory/products",
      icon: Package,
      permission: "inventory.products.view",
    },
    {
      label: "storage",
      description: "storageHint",
      to: "/inventory/stock",
      icon: Boxes,
      permission: "inventory.stock.view",
    },
    {
      label: "cases",
      description: "casesHint",
      to: "/warehouses/cases/icu",
      icon: HeartPulse,
      permission: "inventory.warehouses.view",
    },
    {
      label: "utilities",
      description: "utilitiesHint",
      to: "/warehouses/utilities/item-reduction",
      icon: Settings,
      permission: "inventory.warehouses.view",
    },
    {
      label: "reports",
      description: "reportsHint",
      to: "/warehouses/reports/products-per-patient",
      icon: ChartNoAxesCombined,
      permission: "inventory.warehouses.view",
    },
  ];
  const metrics = [
    {
      label: "products",
      value: d?.products?.pagination.total,
      icon: Package,
      note: "catalogTotal",
    },
    {
      label: "locations",
      value: d?.warehouses.length,
      icon: Warehouse,
      note: "locationsTotal",
    },
    {
      label: "units",
      value: d?.stock ? units : undefined,
      icon: Boxes,
      note: "selectedLocation",
    },
    {
      label: "attention",
      value: d?.stock ? alerts : undefined,
      icon: TriangleAlert,
      note: "reorderNote",
    },
  ];
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-950 via-teal-900 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-14 -top-24 size-80 rounded-full border-[45px] border-white/5"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <Warehouse className="size-4" />
              {t("warehouseModule.title")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("warehouseDashboard.title")}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-teal-100">
              {t("warehouseDashboard.subtitle")}
            </p>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap items-center gap-3">
          {canProducts && (
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-950 transition hover:bg-teal-50"
              to="/inventory/products"
            >
              <Package className="size-4" />
              {t("warehouseModule.addProduct")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          )}
          <Link
            to="/inventory/warehouses"
            className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
          >
            {t("warehouseModule.addStorage")}
          </Link>
        </div>
      </section>
      {(resource.error || alertTable.error) && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {resource.error || alertTable.error}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            {t("warehouseDashboard.overview")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("warehouseDashboard.overviewHint")}
          </p>
        </div>
        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
          {t("warehouseModule.storage")}
          <Select
            value={location}
            onValueChange={setLocation}
            disabled={!d || resource.isLoading}
          >
            <SelectTrigger
              className={
                "max-w-52 rounded-xl border bg-card px-3 py-2 text-foreground"
              }
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("warehouseDashboard.allLocations")}
              </SelectItem>
              {d?.warehouses.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Label>
      </div>
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-busy={resource.isLoading}
      >
        {metrics.map(({ label, value, icon: Icon, note }) => (
          <Card
            key={label}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t(`warehouseDashboard.${label}`)}
              </p>
              <span
                className={`rounded-xl p-2.5 ${label === "attention" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-primary/8 text-primary"}`}
              >
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums">
              {resource.isLoading
                ? "…"
                : value === undefined
                  ? "—"
                  : number(value)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t(`warehouseDashboard.${note}`)}
            </p>
          </Card>
        ))}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-bold">
          {t("warehouseDashboard.workspace")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks
            .filter((item) => hasPermission(storedUser(), item.permission))
            .map(({ label, description, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="rounded-xl bg-primary/8 p-3 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {t(`warehouseModule.${label}`)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {t(`warehouseDashboard.${description}`)}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition group-hover:text-primary rtl:rotate-180" />
              </Link>
            ))}
        </div>
      </section>
      {canStock && (
        <div className="grid gap-5 xl:grid-cols-[1fr_1.5fr]">
          <Card className="rounded-2xl border bg-card p-5 sm:p-6">
            <h2 className="font-bold">{t("warehouseDashboard.health")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("warehouseDashboard.healthHint")}
            </p>
            <p className="mt-6 text-4xl font-bold tabular-nums">
              {resource.isLoading || !d ? "—" : number(total)}
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                {t("warehouseDashboard.stockLines")}
              </span>
            </p>
            <div
              className="my-5 flex h-3 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              {[
                { count: healthy, color: "bg-teal-500" },
                { count: low, color: "bg-amber-400" },
                { count: empty, color: "bg-rose-500" },
              ].map(({ count, color }) => (
                <span
                  key={color}
                  className={color}
                  style={{
                    width: `${total ? (count / total) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
            <div className="space-y-4">
              {[
                { label: "healthy", count: healthy, color: "bg-teal-500" },
                { label: "low", count: low, color: "bg-amber-400" },
                { label: "out", count: empty, color: "bg-rose-500" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span className={`size-2 rounded-full ${color}`} />
                  <span className="flex-1 text-muted-foreground">
                    {t(`warehouseDashboard.${label}`)}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {resource.isLoading || !d ? "—" : number(count)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center justify-between gap-3 p-5">
              <div>
                <h2 className="font-bold">
                  {t("warehouseDashboard.replenish")}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("warehouseDashboard.replenishHint")}
                </p>
              </div>
              <Link
                to="/inventory/stock"
                className="shrink-0 text-xs font-semibold text-primary"
              >
                {t("warehouseDashboard.viewAll")}
              </Link>
            </div>
            {resource.isLoading || !d ? (
              <p className="p-6 text-sm text-muted-foreground">
                {t(
                  resource.isLoading
                    ? "resourceState.loading"
                    : "warehouseDashboard.unavailable",
                )}
              </p>
            ) : alerts === 0 ? (
              <div className="px-6 py-10 text-center">
                <Boxes className="mx-auto mb-3 size-8 text-teal-500" />
                <p className="text-sm font-medium">
                  {t(
                    total
                      ? "warehouseDashboard.noAlerts"
                      : "warehouseDashboard.noStock",
                  )}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full text-start text-sm">
                  <TableHeader className="bg-muted/50 text-xs text-muted-foreground">
                    <TableRow>
                      {["product", "warehouse", "quantity", "reorderLevel"].map(
                        (key) => (
                          <TableHead
                            key={key}
                            className="px-5 py-3 text-start font-medium"
                          >
                            {t(`inventory.fields.${key}`)}
                          </TableHead>
                        ),
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    {...alertTable.tableProps}
                    aria-busy={alertTable.isLoading}
                  >
                    {(alertTable.data ?? []).map((row) => (
                      <TableRow key={row.id} className="border-t">
                        <TableCell className="px-5 py-3 font-medium">
                          {row.product?.name}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-muted-foreground">
                          {row.warehouse?.name}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${Number(row.quantity) <= 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}
                          >
                            {number(Number(row.quantity))}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3 tabular-nums">
                          {number(Number(row.reorderLevel))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}
      {canMovements && (
        <Card className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">{t("warehouseDashboard.activity")}</h2>
            <Link
              to="/inventory/movements"
              className="text-xs font-semibold text-primary"
            >
              {t("warehouseDashboard.viewAll")}
            </Link>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            {t("warehouseDashboard.activityHint")}
          </p>
          {resource.isLoading || !d ? (
            <p className="py-5 text-sm text-muted-foreground">
              {t(
                resource.isLoading
                  ? "resourceState.loading"
                  : "warehouseDashboard.unavailable",
              )}
            </p>
          ) : !d.movements?.items.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("warehouseDashboard.noActivity")}
            </p>
          ) : (
            <div className="grid gap-x-8 md:grid-cols-2">
              {d.movements.items.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 border-t py-4"
                >
                  <span className="rounded-xl bg-muted p-2.5">
                    {Number(row.quantity) < 0 ||
                    ["sale", "transfer_out", "adjustment_out"].includes(
                      row.movementType,
                    ) ? (
                      <ArrowUpRight className="size-4 text-amber-600" />
                    ) : (
                      <ArrowDownLeft className="size-4 text-teal-600" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {row.product?.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {row.warehouse?.name} ·{" "}
                      {new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: "medium",
                      }).format(new Date(row.occurredAt))}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {number(Number(row.quantity))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
