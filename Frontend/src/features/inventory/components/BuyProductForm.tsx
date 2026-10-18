import { ProductSelect } from "../components/ProductSelect";
import { randomId } from "@/shared/lib/random-id";
import { PurchaseProductDialog } from "../components/purchase-product-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Card } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { CreatableSelect } from "@/shared/components/ui/creatable-select";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { productImageUrl, inventoryApi } from "../api/inventory.api";

type Line = {
  id: string;
  productId: string;
  warehouseId: string;
  unit: string;
  customUnit: string;
  quantity: string;
  price: string;
};
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
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const newLine = (): Line => ({
  id: randomId(),
  productId: "",
  warehouseId: "",
  unit: "item",
  customUnit: "",
  quantity: "1",
  price: "0",
});

export type EditablePurchase = {
  id: string;
  invoiceNumber: string;
  buyDate: string;
  retailer: string;
  salesperson: string | null;
  isDebt: boolean;
  hasInvoice?: boolean;
  note: string | null;
  attachmentUrl: string | null;
  items: {
    productId: string;
    warehouseId: string;
    warehouseName?: string;
    productName: string;
    unit?: string;
    quantity: number;
    price: number;
  }[];
};

export function BuyProductForm({
  purchase,
  onSaved,
  onBusy,
}: {
  purchase?: EditablePurchase;
  onSaved: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const canBuy = hasPermission(
    storedUser(),
    purchase ? "inventory.purchases.update" : "inventory.purchases.create",
  );
  const canManage = hasPermission(storedUser(), "inventory.products.create");
  const options = useApiResource(
    useCallback(async () => {
      const warehouses = await inventoryApi.all("warehouses");
      const available = warehouses.filter(
        (w) =>
          w.status === "active" ||
          purchase?.items.some((item) => item.warehouseId === w.id),
      );
      for (const item of purchase?.items ?? []) {
        if (!available.some((row) => row.id === item.warehouseId)) {
          available.push({
            id: item.warehouseId,
            name: item.warehouseName ?? item.warehouseId,
            status: "historical",
          });
        }
      }
      return { warehouses: available };
    }, [purchase]),
  );
  const [retailers, setRetailers] = useState<string[]>([]);
  useEffect(() => {
    void apiClient
      .get<string[]>("/inventory/purchases/retailers")
      .then((r) => setRetailers(r.data))
      .catch(() => {});
  }, []);
  const [invoiceNumber, setInvoiceNumber] = useState(
    purchase?.invoiceNumber ?? "",
  );
  const [buyDate, setBuyDate] = useState(
    () => purchase?.buyDate.slice(0, 10) ?? today(),
  );
  const [retailer, setRetailer] = useState(purchase?.retailer ?? "");
  const [salesperson, setSalesperson] = useState(purchase?.salesperson ?? "");
  const [hasInvoice, setHasInvoice] = useState(
    purchase?.hasInvoice ?? Boolean(purchase?.attachmentUrl),
  );
  const [isDebt, setIsDebt] = useState(purchase?.isDebt ?? false);
  const [note, setNote] = useState(purchase?.note ?? "");
  const [lines, setLines] = useState<Line[]>(() =>
    purchase
      ? purchase.items.map((item) => ({
          id: randomId(),
          productId: item.productId,
          warehouseId: item.warehouseId,
          unit: productUnits.includes(item.unit ?? "item")
            ? (item.unit ?? "item")
            : "other",
          customUnit: item.unit ?? "",
          quantity: String(item.quantity),
          price: String(item.price),
        }))
      : [newLine()],
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(() =>
    purchase?.attachmentUrl ? productImageUrl(purchase.attachmentUrl) : "",
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [newProductLine, setNewProductLine] = useState<string | null>(null);
  const [createdProducts, setCreatedProducts] = useState<
    import("../api/inventory.api").RecordItem[]
  >([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    import("../api/inventory.api").RecordItem[]
  >(
    () =>
      purchase?.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        unit: item.unit,
        costPrice: item.price,
      })) ?? [],
  );
  const purchaseProducts = [...selectedProducts, ...createdProducts];
  const busy = useRef(false);
  const requestId = useRef(randomId());
  const uploadedUrl = useRef<string | null>(purchase?.attachmentUrl ?? null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const setAttachment = (next: File | null) => {
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : "");
    uploadedUrl.current = null;
  };
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const lineTotal = (line: Line) =>
    Math.round(Number(line.quantity) * Math.round(Number(line.price) * 100)) /
    100;
  const total =
    lines.reduce((sum, line) => sum + Math.round(lineTotal(line) * 100), 0) /
    100;
  const changeLine = (id: string, patch: Partial<Line>) =>
    setLines((value) =>
      value.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  const clear = () => {
    setInvoiceNumber("");
    setBuyDate(today());
    setRetailer("");
    setSalesperson("");
    setIsDebt(false);
    setHasInvoice(false);
    setNote("");
    setLines([newLine()]);
    setAttachment(null);
    setError("");
    uploadedUrl.current = null;
    requestId.current = randomId();
    if (fileInput.current) fileInput.current.value = "";
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current || !canBuy) return;
    setError("");
    setSuccess("");
    if (
      !invoiceNumber.trim() ||
      !retailer.trim() ||
      !lines.length ||
      lines.some(
        (line) =>
          !line.productId ||
          !line.warehouseId ||
          !Number.isFinite(Number(line.quantity)) ||
          Number(line.quantity) <= 0 ||
          !line.price ||
          !Number.isFinite(Number(line.price)) ||
          Number(line.price) < 0,
      )
    ) {
      setError(t("buyProductForm.invalid"));
      return;
    }
    if (hasInvoice && !file && !uploadedUrl.current) {
      setError(t("buyProductForm.attachmentRequired"));
      return;
    }
    busy.current = true;
    onBusy(true);
    setSaving(true);
    try {
      if (hasInvoice && file && !uploadedUrl.current)
        uploadedUrl.current = (
          await inventoryApi.uploadImages([file])
        )[0].imageUrl;
      await apiClient.request({
        method: purchase ? "PATCH" : "POST",
        url: purchase
          ? `/inventory/purchases/${purchase.id}`
          : "/inventory/purchases",
        data: {
          requestId: requestId.current,
          invoiceNumber,
          buyDate,
          retailer,
          salesperson,
          isDebt,
          note,
          hasInvoice,
          attachmentUrl: hasInvoice ? uploadedUrl.current : null,
          items: lines.map((line) => ({
            productId: line.productId,
            warehouseId: line.warehouseId,
            unit: line.unit === "other" ? line.customUnit : line.unit,
            quantity: Number(line.quantity),
            price: Number(line.price),
          })),
        },
      });
      setRetailers((value) => [...new Set([...value, retailer.trim()])]);
      clear();
      setSuccess(t("buyProductForm.saved"));
      onSaved();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      busy.current = false;
      onBusy(false);
      setSaving(false);
    }
  };
  const selectClass =
    "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";
  return (
    <form onSubmit={submit} className="flex min-h-0 flex-col overflow-hidden">
      <div className="content-scrollbar min-h-0 overflow-y-auto overscroll-contain">
        <div className="space-y-4 px-6 pb-4">
          {(error || options.error) && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {error || options.error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="rounded-xl border border-teal-500/25 bg-teal-500/10 p-4 text-sm text-teal-700 dark:text-teal-300"
            >
              {success}
            </p>
          )}
          <fieldset
            disabled={saving}
            className="grid min-w-0 gap-4 lg:grid-cols-2"
          >
            <div className="flex min-w-0 flex-col gap-5">
              <Card className="flex flex-1 flex-col rounded-2xl border bg-card p-5">
                <h2 className="mb-5 text-sm font-semibold">
                  {t("buyProductForm.invoiceDetails")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label className="flex flex-col gap-1.5 text-xs font-medium">
                    {t("buyProductForm.invoiceNumber")}
                    <Input
                      className="h-9"
                      required
                      maxLength={100}
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </Label>
                  <Label className="flex flex-col gap-1.5 text-xs font-medium">
                    {t("buyProductForm.buyDate")}
                    <FormDatePicker
                      required
                      value={buyDate}
                      onValueChange={setBuyDate}
                    />
                  </Label>
                  <Label className="flex flex-col gap-1.5 text-xs font-medium">
                    {t("buyProductForm.retailer")}
                    <CreatableSelect
                      required
                      disabled={saving}
                      maxLength={150}
                      placeholder={t("buyProductForm.retailerHint")}
                      value={retailer}
                      onValueChange={setRetailer}
                      options={retailers}
                    />
                  </Label>
                  <Label className="flex flex-col gap-1.5 text-xs font-medium">
                    {t("buyProductForm.totalPrice")}
                    <Input
                      className="h-9 bg-muted/50 font-semibold"
                      readOnly
                      value={money(total)}
                    />
                  </Label>
                  <Label className="flex flex-col gap-1.5 text-xs font-medium">
                    {t("buyProductForm.salesperson")}
                    <Input
                      className="h-9"
                      maxLength={150}
                      value={salesperson}
                      onChange={(e) => setSalesperson(e.target.value)}
                    />
                  </Label>
                  <Label className="flex h-9 items-center gap-2 self-end rounded-lg border px-3 text-xs font-medium">
                    <Checkbox
                      disabled={saving}
                      checked={isDebt}
                      onCheckedChange={(checked) => setIsDebt(checked === true)}
                    />
                    {t("buyProductForm.isDebt")}
                  </Label>
                  <Label className="flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium sm:col-span-2">
                    <Checkbox
                      checked={hasInvoice}
                      disabled={saving}
                      onCheckedChange={(checked) =>
                        setHasInvoice(checked === true)
                      }
                    />
                    {t("buyProductForm.hasInvoice")}
                  </Label>
                  <Label className="flex flex-col gap-1.5 text-xs font-medium sm:col-span-2">
                    {t("buyProductForm.note")}
                    <Input
                      className="h-9"
                      maxLength={5000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </Label>
                </div>
              </Card>

              {!canBuy && (
                <p className="text-sm text-muted-foreground">
                  {t("buyProductForm.noPermission")}
                </p>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-5">
              <Card className="flex flex-1 flex-col rounded-2xl border bg-card p-5">
                <Label
                  className="block text-sm font-semibold"
                  htmlFor="purchase-attachment"
                >
                  {t("buyProductForm.attachment")}{" "}
                  {hasInvoice && <span className="text-destructive">*</span>}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(
                    hasInvoice
                      ? "buyProductForm.attachmentRequired"
                      : "buyProductForm.noInvoice",
                  )}
                </p>
                <Input
                  ref={fileInput}
                  id="purchase-attachment"
                  type="file"
                  aria-required={hasInvoice}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={!canManage || !hasInvoice}
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;
                    if (
                      selected &&
                      (selected.size > 5 * 1024 * 1024 ||
                        ![
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                          "image/gif",
                        ].includes(selected.type))
                    ) {
                      setError(t("buyProductForm.fileError"));
                      e.target.value = "";
                      return;
                    }
                    setAttachment(selected);
                    uploadedUrl.current = null;
                    setError("");
                  }}
                />
                <div className="mt-4 flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/20 p-6">
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt={t("buyProductForm.attachment")}
                        className="max-h-72 max-w-full rounded-lg object-contain"
                      />
                      <Button
                        permission="view"
                        type="button"
                        variant="ghost"
                        className="mt-3"
                        data-action="delete"
                        disabled={!canManage || saving || !hasInvoice}
                        onClick={() => {
                          setAttachment(null);
                          uploadedUrl.current = null;
                          if (fileInput.current) fileInput.current.value = "";
                        }}
                      >
                        <Trash2 className="size-4" />
                        {t("buyProductForm.remove")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      permission="inventory.products.create"
                      type="button"
                      variant="ghost"
                      disabled={!canManage || saving || !hasInvoice}
                      onClick={() => fileInput.current?.click()}
                      className="h-auto w-full flex-col gap-0 whitespace-normal p-4 hover:bg-primary/5"
                    >
                      <span className="mb-4 rounded-2xl bg-teal-500/10 p-5 text-teal-600">
                        <ImagePlus className="size-12" />
                      </span>
                      <p className="text-sm font-medium">
                        {t("buyProductForm.uploadHint")}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("buyProductForm.fileHint")}
                      </p>
                    </Button>
                  )}
                </div>
              </Card>
            </div>
            <Card className="rounded-2xl border bg-card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  {t("buyProductForm.items")}
                </h2>
                <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-600">
                  {lines.length}
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <Table className="min-w-[960px]">
                  <TableHeader>
                    <TableRow>
                      {canManage && (
                        <TableHead className="w-20 whitespace-nowrap">
                          {t("buyProductForm.isNew")}
                        </TableHead>
                      )}
                      {[
                        "warehouseModule.product",
                        "warehouseModule.storage",
                        "inventory.fields.unit",
                        "inventory.fields.quantity",
                        "buyProductForm.price",
                        "buyProductForm.totalPrice",
                        "transferForm.actions",
                      ].map((key) => (
                        <TableHead key={key}>{t(key)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody autoPaginate={false}>
                    {lines.map((line, index) => (
                      <TableRow key={line.id}>
                        {canManage && (
                          <TableCell className="align-middle">
                            <Checkbox
                              aria-label={`${t("buyProductForm.isNew")} ${index + 1}`}
                              checked={
                                newProductLine === line.id ||
                                createdProducts.some(
                                  (product) => product.id === line.productId,
                                )
                              }
                              onCheckedChange={(checked) => {
                                if (checked === true)
                                  setNewProductLine(line.id);
                                else
                                  changeLine(line.id, {
                                    productId: "",
                                    price: "0",
                                    unit: "item",
                                    customUnit: "",
                                  });
                              }}
                            />
                          </TableCell>
                        )}

                        <TableCell className="w-[300px] min-w-[300px] align-middle">
                          <Label className="flex flex-col gap-1 text-xs">
                            <span className="sr-only">
                              {t("warehouseModule.product")}
                            </span>
                            <ProductSelect
                              disabled={saving}
                              className={selectClass}
                              selected={purchaseProducts.find(
                                (product) => product.id === line.productId,
                              )}
                              onChange={(product) => {
                                setSelectedProducts((items) => [
                                  ...items.filter(
                                    (item) => item.id !== product.id,
                                  ),
                                  product,
                                ]);
                                changeLine(line.id, {
                                  productId: product.id,
                                  unit: productUnits.includes(
                                    String(product.unit).toLowerCase(),
                                  )
                                    ? String(product.unit).toLowerCase()
                                    : "other",
                                  customUnit: String(product.unit ?? ""),
                                  price: String(product.costPrice ?? 0),
                                });
                              }}
                            />
                          </Label>
                        </TableCell>
                        <TableCell className="min-w-[200px] align-middle">
                          <Label className="flex flex-col gap-1 text-xs">
                            <span className="sr-only">
                              {t("warehouseModule.storage")}
                            </span>
                            <Select
                              disabled={saving || options.isLoading}
                              value={line.warehouseId}
                              onValueChange={(value) =>
                                changeLine(line.id, { warehouseId: value })
                              }
                              required
                            >
                              <SelectTrigger className={selectClass}>
                                <SelectValue
                                  placeholder={t(
                                    "buyProductForm.selectStorage",
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {options.data?.warehouses.map((w) => (
                                  <SelectItem key={w.id} value={w.id}>
                                    {w.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Label>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Label className="flex flex-col gap-1 text-xs">
                            <span className="sr-only">
                              {t("inventory.fields.unit")}
                            </span>
                            <Select
                              value={line.unit}
                              onValueChange={(unit) =>
                                changeLine(line.id, { unit })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...productUnits, "other"].map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {t(`inventory.units.${unit}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {line.unit === "other" && (
                              <Input
                                required
                                value={line.customUnit}
                                onChange={(event) =>
                                  changeLine(line.id, {
                                    customUnit: event.target.value,
                                  })
                                }
                                placeholder={t("inventory.units.other")}
                              />
                            )}
                          </Label>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Label className="flex flex-col gap-1 text-xs">
                            <span className="sr-only">
                              {t("inventory.fields.quantity")}
                            </span>
                            <Input
                              type="number"
                              required
                              min="0.001"
                              max="1000000"
                              step="0.001"
                              value={line.quantity}
                              onChange={(e) =>
                                changeLine(line.id, {
                                  quantity: e.target.value,
                                })
                              }
                            />
                          </Label>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Label className="flex flex-col gap-1 text-xs">
                            <span className="sr-only">
                              {t("buyProductForm.price")}
                            </span>
                            <Input
                              type="number"
                              required
                              min="0"
                              max="100000000"
                              step="0.01"
                              value={line.price}
                              onChange={(e) =>
                                changeLine(line.id, { price: e.target.value })
                              }
                            />
                          </Label>
                        </TableCell>

                        <TableCell className="align-middle font-semibold tabular-nums">
                          {money(lineTotal(line))}
                        </TableCell>
                        <TableCell className="align-middle">
                          {" "}
                          <Button
                            permission="view"
                            data-action="delete"
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={lines.length === 1}
                            aria-label={`${t("buyProductForm.remove")} ${index + 1}`}
                            onClick={() =>
                              setLines((value) =>
                                value.filter((row) => row.id !== line.id),
                              )
                            }
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button
                type="button"
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={lines.length >= 100 || options.isLoading}
                onClick={() => setLines((value) => [...value, newLine()])}
              >
                <Plus className="size-4" />
                {t("buyProductForm.addItem")}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("buyProductForm.unitHint")}
              </p>
            </Card>
          </fieldset>
        </div>
      </div>
      {newProductLine && (
        <PurchaseProductDialog
          onClose={() => setNewProductLine(null)}
          onCreated={(product) => {
            setCreatedProducts((items) => [...items, product]);
            changeLine(newProductLine, {
              productId: product.id,
              unit: productUnits.includes(product.unit)
                ? product.unit
                : "other",
              customUnit: product.unit,
              price: String(product.costPrice),
            });
            setNewProductLine(null);
          }}
        />
      )}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>{t("buyProductForm.summary")}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table className="w-full text-start text-xs">
              <TableHeader className="border-y bg-muted/40 text-muted-foreground">
                <TableRow>
                  {[
                    "product",
                    "storage",
                    "quantity",
                    "price",
                    "totalPrice",
                  ].map((key) => (
                    <TableHead
                      key={key}
                      className="whitespace-nowrap px-4 py-3 text-start font-medium"
                    >
                      {t(`buyProductForm.${key}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody autoPaginate={false}>
                {lines
                  .filter((line) => line.productId)
                  .map((line) => (
                    <TableRow key={line.id} className="border-b">
                      <TableCell className="px-4 py-3 font-medium">
                        {
                          purchaseProducts.find((p) => p.id === line.productId)
                            ?.name
                        }
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {options.data?.warehouses.find(
                          (w) => w.id === line.warehouseId,
                        )?.name ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 tabular-nums">
                        {line.quantity}{" "}
                        {line.unit === "other" ? line.customUnit : line.unit}
                      </TableCell>
                      <TableCell className="px-4 py-3 tabular-nums">
                        {money(Number(line.price))}
                      </TableCell>
                      <TableCell className="px-4 py-3 tabular-nums">
                        {money(lineTotal(line))}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {!lines.some((line) => line.productId) && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {t("buyProductForm.empty")}
            </p>
          )}
          <div className="flex justify-between gap-3 bg-teal-500/5 p-5 text-sm font-semibold">
            <span>{t("buyProductForm.totalPrice")}</span>
            <output className="text-lg tabular-nums text-teal-700 dark:text-teal-300">
              {money(total)}
            </output>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex shrink-0 flex-wrap gap-3 border-t bg-background px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => setSummaryOpen(true)}
        >
          {t("buyProductForm.summary")}
        </Button>
        <Button
          permission={purchase ? "update" : "create"}
          type="submit"
          disabled={saving || options.isLoading || !!options.error || !canBuy}
          className="h-11 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ShoppingCart className="size-4" />
          {t(
            saving
              ? "buyProductForm.saving"
              : purchase
                ? "common.save"
                : "warehouseModule.buy",
          )}
          <span className="ms-2 tabular-nums">{money(total)}</span>
        </Button>
      </div>
    </form>
  );
}
