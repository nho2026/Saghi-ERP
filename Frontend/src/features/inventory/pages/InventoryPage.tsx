import { hasPagePermission } from "@/features/auth/access";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { Label } from "@/shared/components/ui/label";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import {
  inventoryApi,
  productImageUrl,
  type RecordItem,
} from "../api/inventory.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { storedUser } from "@/features/auth/access";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
type Resource =
  "products" | "categories" | "brands" | "warehouses" | "stock" | "movements";

const toValidDate = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;

  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;
  if (!date) return null;

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value: unknown) => {
  const date = toValidDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "—";
};

const formatDate = (value: unknown) =>
  toValidDate(value)?.toLocaleDateString() ?? "—";

const toDateInputValue = (value: unknown) =>
  toValidDate(value)?.toISOString().slice(0, 10) ?? "";

const configs = {
  categories: {
    fields: ["name", "description", "status"],
    columns: ["name", "description", "status"],
  },
  brands: {
    fields: ["name", "description", "status"],
    columns: ["name", "description", "status"],
  },
  warehouses: {
    fields: ["name", "location", "status"],
    columns: ["code", "name", "location", "status"],
  },
  products: {
    fields: [
      "sku",
      "barcode",
      "name",
      "categoryId",
      "brandId",
      "unit",
      "costPrice",
      "sellingPrice",
      "taxRate",
      "discountType",
      "discountValue",
      "discountStart",
      "discountEnd",
      "expiryDate",
      "status",
    ],
    columns: [
      "sku",
      "barcode",
      "name",
      "category",
      "brand",
      "costPrice",
      "sellingPrice",
      "discount",
      "stock",
      "expiryDate",
      "status",
    ],
  },
} as const;
export default function InventoryPage({ resource }: { resource: Resource }) {
  const { t, i18n } = useTranslation();
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
    "adjust",
    "return",
  );
  const [page, setPage] = useState(1);
  const [productSearch, setProductSearch] = useState(
      () => new URLSearchParams(window.location.search).get("search") ?? "",
    ),
    [categoryFilter, setCategoryFilter] = useState("all"),
    [statusFilter, setStatusFilter] = useState("all"),
    [skuFilter, setSkuFilter] = useState(""),
    [barcodeFilter, setBarcodeFilter] = useState(""),
    [minPrice, setMinPrice] = useState(""),
    [maxPrice, setMaxPrice] = useState(""),
    [discountFilter, setDiscountFilter] = useState("all"),
    [inStock, setInStock] = useState("all"),
    [filterOpen, setFilterOpen] = useState(false);
  const deferredSearch = useDeferredValue(productSearch);
  const data = useApiResource(
    useCallback(
      () =>
        inventoryApi.list(
          resource,
          page,
          resource === "products"
            ? {
                ...(deferredSearch && { search: deferredSearch }),
                ...(categoryFilter !== "all" && { categoryId: categoryFilter }),
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(skuFilter && { sku: skuFilter }),
                ...(barcodeFilter && { barcode: barcodeFilter }),
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
                ...(discountFilter !== "all" && {
                  discountType: discountFilter,
                }),
                ...(inStock === "yes" && { inStock: "true" }),
              }
            : {},
        ),
      [
        resource,
        page,
        deferredSearch,
        categoryFilter,
        statusFilter,
        skuFilter,
        barcodeFilter,
        minPrice,
        maxPrice,
        discountFilter,
        inStock,
      ],
    ),
  );
  const [categories, setCategories] = useState<RecordItem[]>([]);
  const [brands, setBrands] = useState<RecordItem[]>([]);
  const [products, setProducts] = useState<RecordItem[]>([]);
  const [warehouses, setWarehouses] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RecordItem | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<
    { imageUrl: string; isMain: boolean }[]
  >([]);
  const [productView, setProductView] = useState<"grid" | "table">("grid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      inventoryApi.all("categories"),
      inventoryApi.all("brands"),
      inventoryApi.all("products"),
      inventoryApi.all("warehouses"),
    ])
      .then(([c, b, p, w]) => {
        setCategories(c);
        setBrands(b);
        setProducts(p);
        setWarehouses(w);
      })
      .catch(() => {});
  }, []);
  const cfg =
    resource in configs ? configs[resource as keyof typeof configs] : null;
  const columns =
    resource === "stock"
      ? ["product", "warehouse", "quantity", "reorderLevel"]
      : resource === "movements"
        ? [
            "product",
            "warehouse",
            "movementType",
            "quantity",
            "reference",
            "occurredAt",
          ]
        : cfg!.columns;
  const value = (row: RecordItem, key: string) =>
    key === "expiryDate"
      ? row.expiryDate
        ? new Date(row.expiryDate).toLocaleDateString(i18n.language, {
            timeZone: "UTC",
          })
        : t("expiry.unknown")
      : key === "category"
        ? row.category?.name
        : key === "brand"
          ? row.brand?.name
          : key === "stock"
            ? row.stocks?.reduce((s: number, x: any) => s + x.quantity, 0)
            : key === "product"
              ? row.product?.name
              : key === "warehouse"
                ? row.warehouse?.name
                : key === "occurredAt"
                  ? formatDateTime(row[key])
                  : key === "discount"
                    ? row.discountType && row.discountValue
                      ? `${row.discountType === "percentage" ? `${row.discountValue}%` : `${Number(row.discountValue).toLocaleString()} USD`} · ${row.discountStart ? formatDate(row.discountStart) : t("inventory.values.now")} — ${row.discountEnd ? formatDate(row.discountEnd) : t("inventory.values.noExpiry")}`
                      : t("inventory.values.noDiscount")
                    : String(row[key] ?? "—");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values: Record<string, unknown> = Object.fromEntries(
      new FormData(e.currentTarget),
    );
    delete values.productImages;
    if (values.discountType === "none") values.discountType = null;
    if (resource === "products") values.images = productImages;
    try {
      if (resource === "stock") await inventoryApi.adjust(values);
      else
        editing
          ? await inventoryApi.update(resource, editing.id, values)
          : await inventoryApi.create(resource, values);
      setEditing(undefined);
      await data.refresh();
    } catch (x) {
      setError(apiErrorMessage(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t(`inventory.${resource}`)}</h1>
          <p className="text-sm text-muted-foreground">
            {t(`inventory.descriptions.${resource}`)}
          </p>
        </div>
        <div className="flex h-10 items-center gap-2">
          {resource === "products" && (
            <div className="flex h-10 items-center rounded-lg border bg-background p-0.5 shadow-sm">
              <Button
                size="icon"
                className="size-8 rounded-md"
                variant={productView === "grid" ? "default" : "ghost"}
                title={t("pos.gridView")}
                onClick={() => setProductView("grid")}
              >
                <LayoutGrid />
              </Button>
              <Button
                size="icon"
                className="size-8 rounded-md"
                variant={productView === "table" ? "default" : "ghost"}
                title={t("pos.tableView")}
                onClick={() => setProductView("table")}
              >
                <List />
              </Button>
            </div>
          )}
          {canManage && resource !== "movements" && (
            <Button
              permission={resource === "stock" ? "adjust" : "create"}
              className="h-10 leading-none"
              onClick={() => {
                setProductImages([]);
                setEditing(null);
              }}
            >
              <Plus />
              {t(
                resource === "stock"
                  ? "inventory.adjustStock"
                  : "inventory.add",
              )}
            </Button>
          )}
        </div>
      </div>
      {resource === "products" && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                value={productSearch}
                onChange={(event) => {
                  setProductSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t("inventory.searchProducts")}
              />
            </div>
            <Button variant="outline" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal />
              {t("inventory.filters")}
              {[
                categoryFilter !== "all",
                statusFilter !== "all",
                skuFilter,
                barcodeFilter,
                minPrice,
                maxPrice,
                discountFilter !== "all",
                inStock !== "all",
              ].filter(Boolean).length > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {
                    [
                      categoryFilter !== "all",
                      statusFilter !== "all",
                      skuFilter,
                      barcodeFilter,
                      minPrice,
                      maxPrice,
                      discountFilter !== "all",
                      inStock !== "all",
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>
            {(productSearch ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              skuFilter ||
              barcodeFilter ||
              minPrice ||
              maxPrice ||
              discountFilter !== "all" ||
              inStock !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setProductSearch("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setSkuFilter("");
                  setBarcodeFilter("");
                  setMinPrice("");
                  setMaxPrice("");
                  setDiscountFilter("all");
                  setInStock("all");
                  setPage(1);
                }}
              >
                {t("inventory.clearFilters")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal />
              {t("inventory.filters")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={skuFilter}
              onChange={(e) => {
                setSkuFilter(e.target.value);
                setPage(1);
              }}
              placeholder={t("inventory.fields.sku")}
            />
            <Input
              value={barcodeFilter}
              onChange={(e) => {
                setBarcodeFilter(e.target.value);
                setPage(1);
              }}
              placeholder={t("inventory.fields.barcode")}
            />
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("inventory.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("inventory.allCategories")}
                </SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("inventory.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("inventory.allStatuses")}
                </SelectItem>
                <SelectItem value="active">
                  {t("inventory.values.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("inventory.values.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder={t("inventory.minimumPrice")}
            />
            <Input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder={t("inventory.maximumPrice")}
            />
            <Select
              value={discountFilter}
              onValueChange={(value) => {
                setDiscountFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("inventory.discountFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("inventory.allDiscounts")}
                </SelectItem>
                <SelectItem value="percentage">
                  {t("inventory.values.percentage")}
                </SelectItem>
                <SelectItem value="fixed">
                  {t("inventory.values.fixed")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={inStock}
              onValueChange={(value) => {
                setInStock(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("inventory.stockFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("inventory.allStock")}</SelectItem>
                <SelectItem value="yes">
                  {t("inventory.inStockOnly")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setCategoryFilter("all");
                setStatusFilter("all");
                setSkuFilter("");
                setBarcodeFilter("");
                setMinPrice("");
                setMaxPrice("");
                setDiscountFilter("all");
                setInStock("all");
                setPage(1);
              }}
            >
              {t("inventory.clearFilters")}
            </Button>
            <Button onClick={() => setFilterOpen(false)}>
              {t("inventory.applyFilters")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card>
        <CardContent className="p-0">
          {resource === "products" && productView === "grid" ? (
            <ProductGrid
              rows={data.data?.items ?? []}
              loading={data.isLoading}
              error={data.error ?? ""}
              t={t}
              canManage={canManage}
              onEdit={(row) => {
                setProductImages(
                  row.images?.map((image: RecordItem) => ({
                    imageUrl: image.imageUrl,
                    isMain: image.isMain,
                  })) ?? [],
                );
                setEditing(row);
              }}
              onDelete={async (row) => {
                setDeleteTarget(row);
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((k) => (
                    <TableHead key={k}>{t(`inventory.fields.${k}`)}</TableHead>
                  ))}
                  {cfg && canManage && (
                    <TableHead className="text-end">
                      {t("table.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody autoPaginate={false}>
                <TableResourceState
                  isLoading={data.isLoading}
                  error={data.error}
                  isEmpty={!data.data?.items.length}
                  colSpan={columns.length + (cfg && canManage ? 1 : 0)}
                />
                {data.data?.items.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((k) => (
                      <TableCell key={k}>{value(row, k)}</TableCell>
                    ))}
                    {cfg && canManage && (
                      <TableCell className="text-end">
                        <div className="flex flex-wrap items-center gap-2 justify-end">
                          <Button
                            data-action="edit"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProductImages(
                                row.images?.map((image: RecordItem) => ({
                                  imageUrl: image.imageUrl,
                                  isMain: image.isMain,
                                })) ?? [],
                              );
                              setEditing(row);
                            }}
                            title={t("inventory.edit")}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            data-action="delete"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            title={t("inventory.delete")}
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="size-4 text-white" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data.data?.pagination && (
            <div className="flex items-center justify-between border-t p-3">
              <span className="text-xs text-muted-foreground">
                {t("pagination.summary", { ...data.data.pagination })}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="rtl:rotate-180" />
                  {t("pagination.previous")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("pagination.next")}
                  <ChevronRight className="rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.deleteDescription", {
                name: deleteTarget?.name ?? deleteTarget?.sku ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              permission="delete"
              disabled={busy}
              onClick={async () => {
                if (!deleteTarget) return;
                setBusy(true);
                try {
                  await inventoryApi.remove(resource, deleteTarget.id);
                  setDeleteTarget(null);
                  await data.refresh();
                } catch (cause) {
                  setError(apiErrorMessage(cause));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t("common.deletePermanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
      >
        <DialogContent
          className={`flex max-h-[90dvh] flex-col overflow-hidden ${resource === "products" ? "sm:max-w-4xl" : ""}`}
        >
          <DialogHeader>
            <DialogTitle>
              {t(
                resource === "stock"
                  ? "inventory.adjustStock"
                  : editing
                    ? "inventory.edit"
                    : "inventory.add",
              )}
            </DialogTitle>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-col gap-4 overflow-hidden"
            onSubmit={submit}
          >
            <div
              className={`content-scrollbar grid min-h-0 gap-4 overflow-y-auto overscroll-contain pe-3 pb-2 sm:grid-cols-2 ${resource === "products" ? "lg:grid-cols-3" : ""}`}
            >
              {resource === "stock" ? (
                <>
                  <Picker
                    name="productId"
                    items={products}
                    label={t("inventory.fields.product")}
                  />
                  <Picker
                    name="warehouseId"
                    items={warehouses}
                    label={t("inventory.fields.warehouse")}
                  />
                  <Picker
                    name="movementType"
                    label={t("inventory.fields.movementType")}
                    items={[
                      "purchase",
                      "adjustment_in",
                      "adjustment_out",
                      "return",
                    ].map((id) => ({ id, name: t(`inventory.values.${id}`) }))}
                  />
                  <Input
                    name="quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder={t("inventory.fields.quantity")}
                  />
                  <Input
                    name="reorderLevel"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t("inventory.fields.reorderLevel")}
                  />
                  <Input
                    name="reference"
                    placeholder={t("inventory.fields.reference")}
                  />
                </>
              ) : (
                <>
                  {cfg?.fields.map((k) => (
                    <div
                      key={k}
                      className="min-w-0 space-y-2"
                      role="group"
                      aria-labelledby={`inventory-label-${k}`}
                    >
                      <Label
                        id={`inventory-label-${k}`}
                        htmlFor={`inventory-field-${k}`}
                      >
                        {t(
                          `inventory.fields.${k === "categoryId" ? "category" : k === "brandId" ? "brand" : k}`,
                        )}
                      </Label>
                      {k === "categoryId" ? (
                        <Picker
                          key={k}
                          name={k}
                          items={categories}
                          label={t("inventory.fields.category")}
                          initial={
                            editing?.[k] ? String(editing[k]) : undefined
                          }
                        />
                      ) : k === "brandId" ? (
                        <Picker
                          key={k}
                          name={k}
                          items={brands}
                          label={t("inventory.fields.brand")}
                          initial={
                            editing?.[k] ? String(editing[k]) : undefined
                          }
                        />
                      ) : k === "unit" ? (
                        <UnitPicker initial={String(editing?.[k] ?? "item")} />
                      ) : k === "status" ? (
                        <Picker
                          key={k}
                          name={k}
                          label={t("inventory.fields.status")}
                          initial={String(editing?.[k] ?? "active")}
                          items={["active", "inactive"].map((id) => ({
                            id,
                            name: t(`inventory.values.${id}`),
                          }))}
                        />
                      ) : k === "discountType" ? (
                        <Picker
                          key={k}
                          name={k}
                          label={t("inventory.fields.discountType")}
                          initial={String(editing?.[k] ?? "none")}
                          items={["none", "percentage", "fixed"].map((id) => ({
                            id,
                            name: t(`inventory.values.${id}`),
                          }))}
                        />
                      ) : [
                          "discountStart",
                          "discountEnd",
                          "expiryDate",
                        ].includes(k) ? (
                        <FormDatePicker
                          key={k}
                          name={k}
                          initialValue={toDateInputValue(editing?.[k])}
                        />
                      ) : (
                        <Input
                          key={k}
                          id={`inventory-field-${k}`}
                          name={k}
                          type={
                            [
                              "costPrice",
                              "sellingPrice",
                              "taxRate",
                              "discountValue",
                            ].includes(k)
                              ? "number"
                              : "text"
                          }
                          step="0.01"
                          defaultValue={String(editing?.[k] ?? "")}
                          placeholder={t(`inventory.fields.${k}`)}
                          required={
                            ![
                              "barcode",
                              "description",
                              "location",
                              "discountStart",
                              "discountEnd",
                            ].includes(k)
                          }
                        />
                      )}
                    </div>
                  ))}
                  {resource === "products" && (
                    <div className="col-span-full grid gap-3 sm:grid-cols-2">
                      <p className="col-span-full font-semibold">
                        {t("drugDose.title")}
                      </p>
                      {(
                        [
                          "doseMgKgDay",
                          "dosesPerDay",
                          "concentrationMg",
                          "concentrationMl",
                        ] as const
                      ).map((field) => (
                        <div key={field} className="space-y-1">
                          <Label htmlFor={`drug-${field}`}>
                            {t(`drugDose.${field}`)}
                          </Label>
                          <Input
                            id={`drug-${field}`}
                            name={field}
                            type="number"
                            min="0.000001"
                            step={field === "dosesPerDay" ? "1" : "any"}
                            max={field === "dosesPerDay" ? 24 : undefined}
                            defaultValue={editing?.[field] ?? ""}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {resource === "products" && (
                    <div className="space-y-3 col-span-full">
                      <Label className="text-sm font-medium">
                        {t("inventory.fields.images")}
                      </Label>
                      <Input
                        ref={imageInputRef}
                        className="hidden"
                        disabled={busy || productImages.length >= 8}
                        name="productImages"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={async (event) => {
                          const files = Array.from(
                            event.target.files ?? [],
                          ).slice(0, 8 - productImages.length);
                          event.target.value = "";
                          if (!files.length) return;
                          setUploadingImages(true);
                          setBusy(true);
                          try {
                            const uploaded =
                              await inventoryApi.uploadImages(files);
                            setProductImages((current) =>
                              [
                                ...current,
                                ...uploaded.map((image, index) => ({
                                  ...image,
                                  isMain: current.length === 0 && index === 0,
                                })),
                              ].slice(0, 8),
                            );
                          } catch (cause) {
                            setError(apiErrorMessage(cause));
                          } finally {
                            setUploadingImages(false);
                            setBusy(false);
                          }
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-4">
                        {productImages.map((image, index) => (
                          <div
                            key={image.imageUrl}
                            className={`relative rounded-xl border bg-background p-2 ${image.isMain ? "ring-2 ring-primary" : ""}`}
                          >
                            <img
                              src={productImageUrl(image.imageUrl)}
                              alt=""
                              className="aspect-square w-full rounded-lg object-contain"
                            />
                            <Button
                              permission="inventory.products.delete"
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute end-2 top-2 size-7 text-white hover:text-white [&_svg]:text-white"
                              disabled={busy && !uploadingImages}
                              aria-label={t("actionTooltip.delete")}
                              onClick={async () => {
                                try {
                                  await inventoryApi.removeImage(
                                    image.imageUrl,
                                  );
                                  setProductImages((items) =>
                                    items
                                      .filter(
                                        (item) =>
                                          item.imageUrl !== image.imageUrl,
                                      )
                                      .map((item, i, remaining) => ({
                                        ...item,
                                        isMain: remaining.some(
                                          (entry) => entry.isMain,
                                        )
                                          ? item.isMain
                                          : i === 0,
                                      })),
                                  );
                                } catch (cause) {
                                  setError(apiErrorMessage(cause));
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant={image.isMain ? "default" : "secondary"}
                              size="icon"
                              className="absolute bottom-2 inset-s-2 size-7"
                              disabled={busy}
                              title={t("inventory.setMainImage")}
                              onClick={() =>
                                setProductImages((items) =>
                                  items.map((item, i) => ({
                                    ...item,
                                    isMain: i === index,
                                  })),
                                )
                              }
                            >
                              <Star
                                className={image.isMain ? "fill-current" : ""}
                              />
                            </Button>
                          </div>
                        ))}
                        <Button
                          permission="inventory.products.create"
                          type="button"
                          variant="ghost"
                          disabled={busy || productImages.length >= 8}
                          onClick={() => imageInputRef.current?.click()}
                          className="h-auto min-h-28 flex-col gap-2 whitespace-normal rounded-xl border-2 border-dashed border-primary/30 bg-background p-4 text-primary hover:bg-primary/5"
                        >
                          <Plus className="size-6" />
                          <span>{t("inventory.fields.images")}</span>
                          <span className="text-xs text-muted-foreground">
                            {productImages.length} / 8
                          </span>
                        </Button>
                      </div>
                      <small className="text-muted-foreground">
                        {t("inventory.imageHelp")}
                      </small>
                    </div>
                  )}
                </>
              )}
              {error && (
                <p className="text-sm text-destructive col-span-full">
                  {error}
                </p>
              )}
            </div>
            <Button
              permission={
                resource === "stock" ? "adjust" : editing ? "update" : "create"
              }
              disabled={busy}
              className="w-full shrink-0"
            >
              {busy ? t("inventory.saving") : t("inventory.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function ProductGrid({
  rows,
  loading,
  error,
  t,
  onEdit,
  onDelete,
  canManage,
}: {
  rows: RecordItem[];
  loading: boolean;
  error: string;
  t: (key: string, options?: Record<string, unknown>) => string;
  onEdit: (row: RecordItem) => void;
  onDelete: (row: RecordItem) => Promise<void>;
  canManage: boolean;
}) {
  if (loading)
    return (
      <p className="py-20 text-center text-muted-foreground">
        {t("resourceState.loading")}
      </p>
    );
  if (error)
    return <p className="py-20 text-center text-destructive">{error}</p>;
  if (!rows.length)
    return (
      <p className="py-20 text-center text-muted-foreground">
        {t("resourceState.notFound")}
      </p>
    );
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {rows.map((row) => {
        const image =
          row.images?.find((item: RecordItem) => item.isMain)?.imageUrl ??
          row.images?.[0]?.imageUrl;
        const stock =
          row.stocks?.reduce(
            (sum: number, item: RecordItem) => sum + item.quantity,
            0,
          ) ?? 0;
        return (
          <article
            key={row.id}
            className="overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-5/3 bg-muted">
              {image ? (
                <img
                  src={productImageUrl(image)}
                  alt={row.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <LayoutGrid className="size-10 text-muted-foreground/25" />
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <small className="text-muted-foreground">
                    {row.category?.name ?? "—"}
                  </small>
                  <h3 className="truncate font-bold">{row.name}</h3>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px]">
                  {t(`inventory.values.${row.status}`)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <span>
                  <b>{t("inventory.fields.sku")}</b>
                  <br />
                  {row.sku}
                </span>
                <span>
                  <b>{t("inventory.fields.barcode")}</b>
                  <br />
                  <span className="font-mono">{row.barcode}</span>
                </span>
                <span>
                  <b>{t("inventory.fields.sellingPrice")}</b>
                  <br />
                  {Number(row.sellingPrice).toLocaleString()} USD
                </span>
                <span>
                  <b>{t("inventory.fields.stock")}</b>
                  <br />
                  {stock}
                </span>
              </div>
              {row.discountType && row.discountValue > 0 && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {row.discountType === "percentage"
                    ? `${row.discountValue}%`
                    : `${Number(row.discountValue).toLocaleString()} USD`}{" "}
                  · {t("inventory.fields.discount")}
                </div>
              )}
              {canManage && (
                <div className="flex justify-end border-t pt-2">
                  <Button
                    data-action="edit"
                    variant="ghost"
                    size="icon"
                    title={t("inventory.edit")}
                    onClick={() => onEdit(row)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    data-action="delete"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    title={t("inventory.delete")}
                    onClick={() => void onDelete(row)}
                  >
                    <Trash2 className="size-4 text-white" />
                  </Button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
function Picker({
  name,
  items,
  label,
  initial,
}: {
  name: string;
  items: RecordItem[];
  label: string;
  initial?: string;
}) {
  return (
    <SearchableSelect
      id={`inventory-field-${name}`}
      name={name}
      defaultValue={initial}
      placeholder={label}
      options={items.map((item) => ({ value: item.id, label: item.name }))}
    />
  );
}

const productUnits = [
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
];

function UnitPicker({ initial }: { initial: string }) {
  const { t } = useTranslation();
  const normalized = initial.trim().toLowerCase();
  const [unit, setUnit] = useState(
    productUnits.includes(normalized) ? normalized : "other",
  );
  return (
    <div className="space-y-2">
      <Select
        name={unit === "other" ? "unitSelection" : "unit"}
        value={unit}
        onValueChange={setUnit}
      >
        <SelectTrigger id="inventory-field-unit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[...productUnits, "other"].map((value) => (
            <SelectItem key={value} value={value}>
              {t(`inventory.units.${value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {unit === "other" && (
        <Input
          name="unit"
          required
          defaultValue={productUnits.includes(normalized) ? "" : initial}
          aria-label={t("inventory.units.other")}
          placeholder={t("inventory.units.other")}
        />
      )}
    </div>
  );
}
