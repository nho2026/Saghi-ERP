import { hasPagePermission } from "@/features/auth/access";
import { randomId } from "@/shared/lib/random-id";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Card } from "@/shared/components/ui/card";
import { useCallback, useDeferredValue, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil } from "lucide-react";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { inventoryApi } from "../api/inventory.api";
import { storedUser } from "@/features/auth/access";
type Variant = {
  id: string;
  code: string;
  barcode: string;
  productionCompany: string;
};
const newVariant = (): Variant => ({
  id: randomId(),
  code: "",
  barcode: "",
  productionCompany: "",
});
const drugFields = [
  "doseMgKgDay",
  "dosesPerDay",
  "concentrationMg",
  "concentrationMl",
] as const;
type SpecialProduct = {
  doseMgKgDay?: number | null;
  dosesPerDay?: number | null;
  concentrationMg?: number | null;
  concentrationMl?: number | null;

  id: string;
  name: string;
  categoryId: string;
  category?: { name: string };
  size: string;
  boxPrice: number;
  specialProfitRate: number;
  specialPrice: number;
  productType: string;
  sku: string;
  barcode: string;
  productionCompany: string;
};
function SpecialProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product: SpecialProduct | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const categories = useApiResource(
    useCallback(
      () =>
        inventoryApi
          .all("categories")
          .then((rows) => rows.filter((row) => row.status === "active")),
      [],
    ),
  );
  const [drug, setDrug] = useState(() =>
    Object.fromEntries(
      drugFields.map((field) => [field, String(product?.[field] ?? "")]),
    ),
  );
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [boxPrice, setBoxPrice] = useState(String(product?.boxPrice ?? 0));
  const [profit, setProfit] = useState(
    String(product?.specialProfitRate ?? 15),
  );
  const [specialPrice, setSpecialPrice] = useState(
    String(product?.specialPrice ?? 0),
  );
  const [productType, setProductType] = useState(
    product?.productType ?? "patient_use",
  );
  const [variants, setVariants] = useState<Variant[]>(
    product
      ? [
          {
            id: product.id,
            code: product.sku,
            barcode: product.barcode || "",
            productionCompany: product.productionCompany || "",
          },
        ]
      : [newVariant()],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
  );
  const change = (id: string, patch: Partial<Variant>) =>
    setVariants((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current || !canManage) return;
    setError("");
    if (
      name.trim().length < 2 ||
      !categoryId ||
      variants.some((v) => !v.code.trim()) ||
      [boxPrice, profit, specialPrice].some(
        (v) => !v || !Number.isFinite(Number(v)) || Number(v) < 0,
      ) ||
      Number(profit) > 100
    ) {
      setError(t("specialProduct.invalid"));
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const payload = {
        name,
        categoryId,
        size,
        boxPrice: Number(boxPrice),
        specialProfitRate: Number(profit),
        specialPrice: Number(specialPrice),
        productType,
        ...Object.fromEntries(
          drugFields.map((field) => [
            field,
            drug[field] === "" ? null : Number(drug[field]),
          ]),
        ),
        variants: variants.map(({ code, barcode, productionCompany }) => ({
          code,
          barcode,
          productionCompany,
        })),
      };
      if (product)
        await apiClient.patch(
          `/inventory/products/special/${product.id}`,
          payload,
        );
      else await apiClient.post("/inventory/products/special", payload);
      onSaved();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const row = variants[0];
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="col-span-full font-semibold">{t("drugDose.title")}</p>
        {drugFields.map((field) => (
          <div key={field} className="space-y-1">
            <Label htmlFor={`drug-${field}`}>{t(`drugDose.${field}`)}</Label>
            <Input
              id={`drug-${field}`}
              type="number"
              min="0.000001"
              step={field === "dosesPerDay" ? 1 : "any"}
              max={field === "dosesPerDay" ? 24 : undefined}
              disabled={busy}
              value={drug[field]}
              onChange={(event) =>
                setDrug((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>
      {(error || categories.error) && (
        <p role="alert" className="text-sm text-destructive">
          {error || categories.error}
        </p>
      )}
      <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="special-name">{t("specialProduct.name")}</Label>
          <Input
            id="special-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={191}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-code">{t("orderForm.code")}</Label>
          <Input
            id="special-code"
            value={row.code}
            onChange={(event) =>
              ((value: string) => change(row.id, { code: value }))(
                event.target.value,
              )
            }
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-barcode">{t("specialProduct.barcode")}</Label>
          <Input
            id="special-barcode"
            value={row.barcode}
            onChange={(event) =>
              ((value: string) => change(row.id, { barcode: value }))(
                event.target.value,
              )
            }
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-size">{t("orderForm.size")}</Label>
          <Input
            id="special-size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-category">
            {t("specialProduct.category")}
          </Label>
          <Select
            required
            disabled={busy || categories.isLoading}
            value={categoryId}
            onValueChange={setCategoryId}
          >
            <SelectTrigger id="special-category">
              <SelectValue placeholder={t("common.selectOption")} />
            </SelectTrigger>
            <SelectContent>
              {categories.data?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-company">
            {t("warehouseModule.productionCompanies")}
          </Label>
          <Input
            id="special-company"
            value={row.productionCompany}
            maxLength={191}
            onChange={(event) =>
              change(row.id, { productionCompany: event.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-box">{t("specialProduct.boxPrice")}</Label>
          <Input
            id="special-box"
            type="number"
            required
            min="0"
            max={100000000}
            step="0.01"
            value={boxPrice}
            onChange={(event) => setBoxPrice(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-profit">{t("specialProduct.profit")}</Label>
          <Input
            id="special-profit"
            type="number"
            required
            min="0"
            max={100}
            step="0.01"
            value={profit}
            onChange={(event) => setProfit(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-price">{t("specialProduct.price")}</Label>
          <Input
            id="special-price"
            type="number"
            required
            min="0"
            max={100000000}
            step="0.01"
            value={specialPrice}
            onChange={(event) => setSpecialPrice(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="special-type">{t("specialProduct.type")}</Label>
          <Select
            disabled={busy}
            value={productType}
            onValueChange={setProductType}
          >
            <SelectTrigger id="special-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient_use">
                {t("specialProduct.patient")}
              </SelectItem>
              <SelectItem value="staff_use">
                {t("specialProduct.staff")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </fieldset>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          {t("common.cancel")}
        </Button>
        <Button
          permission={product ? "update" : "create"}
          type="submit"
          disabled={
            busy || !canManage || categories.isLoading || !!categories.error
          }
        >
          {t(busy ? "buyHistory.processing" : "common.save")}
        </Button>
      </div>
    </form>
  );
}

export default function AddSpecialProductPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialProduct | null>(null);
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
  );
  const result = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<{
            items: SpecialProduct[];
            pagination: { totalPages: number; total: number };
          }>("/inventory/products", {
            params: {
              isSpecial: "true",
              search: query,
              page,
              pageSize: 10,
              compact: "true",
              includeStocks: "false",
            },
          })
          .then((r) => r.data),
      [query, page],
    ),
  );
  const money = (v: number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("specialProduct.list")}</h1>
        <div className="flex gap-2">
          {canManage && (
            <Button
              permission="create"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("warehouseModule.addSpecialProduct")}
            </Button>
          )}
        </div>
      </header>
      {result.error && (
        <p role="alert" className="text-destructive">
          {result.error}
        </p>
      )}
      <Card>
        <div className="p-3">
          <Input
            className="max-w-sm"
            value={search}
            aria-label={t("specialProduct.search")}
            placeholder={t("specialProduct.search")}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "name",
                "category",
                "size",
                "code",
                "barcode",
                "boxPrice",
                "profit",
                "price",
                "type",
                "company",
                "actions",
              ].map((key) => (
                <TableHead key={key}>
                  {t(
                    key === "size" || key === "code" || key === "actions"
                      ? `orderForm.${key}`
                      : key === "company"
                        ? "warehouseModule.productionCompanies"
                        : `specialProduct.${key}`,
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {result.isLoading || result.error || !result.data?.items.length ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-28 text-center text-muted-foreground"
                >
                  {t(
                    result.isLoading
                      ? "resourceState.loading"
                      : result.error
                        ? "warehouseDashboard.unavailable"
                        : "resourceState.notFound",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              result.data.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category?.name ?? "—"}</TableCell>
                  <TableCell>{row.size || "—"}</TableCell>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell>{row.barcode || "—"}</TableCell>
                  <TableCell>{money(row.boxPrice)}</TableCell>
                  <TableCell>{row.specialProfitRate}%</TableCell>
                  <TableCell>{money(row.specialPrice)}</TableCell>
                  <TableCell>
                    {t(
                      row.productType === "staff_use"
                        ? "specialProduct.staff"
                        : "specialProduct.patient",
                    )}
                  </TableCell>
                  <TableCell>{row.productionCompany || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {canManage && (
                        <Button
                          data-action="edit"
                          variant="outline"
                          size="icon"
                          aria-label={`${t("specialProduct.edit")} ${row.name}`}
                          onClick={() => {
                            setEditing(row);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <footer className="flex justify-between gap-3 border-t p-3">
          <span className="text-xs text-muted-foreground">
            {t("specialProduct.pagination", {
              page,
              pages: result.data?.pagination.totalPages ?? 1,
              total: result.data?.pagination.total ?? 0,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.isLoading || page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("buyHistory.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                result.isLoading ||
                page >= (result.data?.pagination.totalPages ?? 1)
              }
              onClick={() => setPage((p) => p + 1)}
            >
              {t("buyHistory.next")}
            </Button>
          </div>
        </footer>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {t(
                editing
                  ? "specialProduct.edit"
                  : "warehouseModule.addSpecialProduct",
              )}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <SpecialProductForm
              key={editing?.id ?? "new"}
              product={editing}
              onCancel={() => setOpen(false)}
              onSaved={() => {
                setOpen(false);
                void result.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
