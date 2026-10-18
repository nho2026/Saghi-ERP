import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Printer, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { inventoryApi, posApi, type RecordItem } from "../api/inventory.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
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
import { printPosInvoice } from "../components/logic/print-pos-invoice";
import { storedUser } from "@/features/auth/access";
import { SaleFilters } from "../components/SaleFilters";
export default function PosPage({ mode }: { mode: "checkout" | "sales" }) {
  const { t } = useTranslation();
  const canCancelSales = storedUser()?.permissions?.includes("*") === true;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [cancelTarget, setCancelTarget] = useState<RecordItem | null>(null);
  const [cancelPassword, setCancelPassword] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const sales = useApiResource(
    useCallback(() => posApi.list(page, filters), [page, filters]),
  );
  const [products, setProducts] = useState<RecordItem[]>([]),
    [warehouses, setWarehouses] = useState<RecordItem[]>([]),
    [warehouseId, setWarehouse] = useState(""),
    [cart, setCart] = useState<Record<string, number>>({}),
    [discount, setDiscount] = useState(0),
    [paid, setPaid] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([
      inventoryApi.all("products"),
      inventoryApi.all("warehouses"),
    ]).then(([p, w]) => {
      setProducts(p.filter((x) => x.status === "active"));
      setWarehouses(
        mode === "sales" ? w : w.filter((x) => x.status === "active"),
      );
      setWarehouse((x) => x || w[0]?.id || "");
    });
  }, [mode]);
  const lines = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: products.find((p) => p.id === id)!,
      quantity,
    }))
    .filter((x) => x.product);
  const subtotal = lines.reduce(
      (s, x) => s + x.product.sellingPrice * x.quantity,
      0,
    ),
    tax = lines.reduce(
      (s, x) =>
        s + (x.product.sellingPrice * x.quantity * x.product.taxRate) / 100,
      0,
    ),
    total = Math.max(0, subtotal + tax - discount);
  const stock = (p: RecordItem) =>
    p.stocks?.find((s: RecordItem) => s.warehouseId === warehouseId)
      ?.quantity ?? 0;
  const add = (id: string) =>
    setCart((c) => ({
      ...c,
      [id]: Math.min(
        (c[id] ?? 0) + 1,
        stock(products.find((p) => p.id === id)!),
      ),
    }));
  const complete = async () => {
    setBusy(true);
    try {
      await posApi.create({
        warehouseId,
        paymentMethod: "cash",
        discountAmount: discount,
        paidAmount: paid,
        items: lines.map((x) => ({
          productId: x.product.id,
          quantity: x.quantity,
        })),
      });
      toast.success(t("pos.completed"));
      setCart({});
      setDiscount(0);
      setPaid(0);
      await sales.refresh();
      const p = await inventoryApi.all("products");
      setProducts(p.filter((x) => x.status === "active"));
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  if (mode === "sales")
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">{t("pos.sales")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("pos.salesDescription")}
          </p>
        </div>
        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center gap-3 border-b p-4">
              <SaleFilters
                value={filters}
                warehouses={warehouses.map((warehouse) => ({
                  id: warehouse.id,
                  name: String(warehouse.name),
                }))}
                onApply={(next) => {
                  setFilters(next);
                  setPage(1);
                }}
              />
              {Object.values(filters).some(Boolean) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilters({});
                    setPage(1);
                  }}
                >
                  {t("inventory.clearFilters")}
                </Button>
              )}
            </div>
            <Table className="min-w-300 [&_th]:px-6 [&_th]:py-4 [&_th]:whitespace-nowrap [&_td]:px-6 [&_td]:py-4 [&_td]:whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  {[
                    "saleNumber",
                    "soldAt",
                    "warehouse",
                    "cashier",
                    "payment",
                    "total",
                    "status",
                  ].map((k) => (
                    <TableHead key={k}>{t(`pos.fields.${k}`)}</TableHead>
                  ))}
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody autoPaginate={false}>
                <TableResourceState
                  isLoading={sales.isLoading}
                  error={sales.error}
                  isEmpty={!sales.data?.items.length}
                  colSpan={8}
                />
                {!sales.isLoading &&
                  !sales.error &&
                  sales.data?.items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.saleNumber}</TableCell>
                      <TableCell>
                        {new Date(s.soldAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{s.warehouse?.name}</TableCell>
                      <TableCell>{s.cashierName}</TableCell>
                      <TableCell>
                        {t(`pos.values.${s.paymentMethod}`)}
                      </TableCell>
                      <TableCell>
                        {s.totalAmount.toLocaleString()} USD
                      </TableCell>
                      <TableCell>{t(`pos.values.${s.status}`)}</TableCell>
                      <TableCell>
                        <Button
                          permission="print"
                          size="icon"
                          variant="ghost"
                          title={t("pos.print")}
                          onClick={() => printPosInvoice(s, t)}
                        >
                          <Printer />
                        </Button>
                        {canCancelSales && s.status !== "cancelled" && (
                          <Button
                            permission="cancel"
                            size="sm"
                            variant="destructive"
                            onClick={() => setCancelTarget(s)}
                          >
                            {t("pos.cancel")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex justify-between border-t p-3">
              <span>
                {t("pagination.summary", { ...sales.data?.pagination })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={sales.isLoading || page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t("pagination.previous")}
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    sales.isLoading ||
                    page >= (sales.data?.pagination.totalPages ?? 1)
                  }
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("pagination.next")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <AlertDialog
          open={cancelTarget !== null}
          onOpenChange={(open) => {
            if (!open && !isCancelling) {
              setCancelTarget(null);
              setCancelPassword("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("pos.cancel")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("pos.cancelConfirm")}
              </AlertDialogDescription>
              <Input
                type="password"
                value={cancelPassword}
                onChange={(event) => setCancelPassword(event.target.value)}
                placeholder={t("pos.cancelPassword")}
                aria-label={t("pos.cancelPassword")}
                autoComplete="current-password"
                autoFocus
              />
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                permission="pos.sales.cancel"
                disabled={!cancelPassword || isCancelling}
                onClick={async (event) => {
                  event.preventDefault();
                  if (!cancelTarget) return;
                  setIsCancelling(true);
                  try {
                    await posApi.cancel(cancelTarget.id, cancelPassword);
                    setCancelTarget(null);
                    setCancelPassword("");
                    await sales.refresh();
                  } catch (error) {
                    toast.error(apiErrorMessage(error));
                  } finally {
                    setIsCancelling(false);
                  }
                }}
              >
                {isCancelling ? t("pos.cancelling") : t("pos.cancel")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("pos.checkout")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("pos.checkoutDescription")}
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div className="flex gap-3">
              <Select
                value={warehouseId}
                onValueChange={(v) => {
                  setWarehouse(v);
                  setCart({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.fields.warehouse")} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 grid-cols-5">
            {products.map((p) => (
              <Button
                variant="outline"
                type="button"
                key={p.id}
                disabled={!stock(p)}
                onClick={() => add(p.id)}
                className="block h-auto whitespace-normal rounded-xl border p-4 text-start transition hover:border-primary disabled:opacity-40"
              >
                <b>{p.name}</b>
                <small className="mt-1 block text-muted-foreground">
                  {p.sku} · {t("pos.inStock", { count: stock(p) })}
                </small>
                <strong className="mt-3 block text-primary">
                  {p.sellingPrice.toLocaleString()} USD
                </strong>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <ShoppingCart />
              {t("pos.cart")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!lines.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("pos.emptyCart")}
              </p>
            )}
            {lines.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-2 border-b pb-3"
              >
                <div className="min-w-0 flex-1">
                  <b className="block truncate">{product.name}</b>
                  <small>
                    {(product.sellingPrice * quantity).toLocaleString()} USD
                  </small>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setCart((c) => ({
                      ...c,
                      [product.id]: Math.max(1, quantity - 1),
                    }))
                  }
                >
                  <Minus />
                </Button>
                <span>{quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={quantity >= stock(product)}
                  onClick={() => add(product.id)}
                >
                  <Plus />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setCart((c) => {
                      const n = { ...c };
                      delete n[product.id];
                      return n;
                    })
                  }
                >
                  <X />
                </Button>
              </div>
            ))}
            <Summary label={t("pos.subtotal")} value={subtotal} />
            <Summary label={t("pos.tax")} value={tax} />
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(+e.target.value)}
              placeholder={t("pos.discount")}
            />
            <Summary label={t("pos.total")} value={total} strong />
            <Input
              type="number"
              min="0"
              value={paid}
              onChange={(e) => setPaid(+e.target.value)}
              placeholder={t("pos.paid")}
            />
            <Summary
              label={t("pos.change")}
              value={Math.max(0, paid - total)}
            />
            <Button
              permission="pos.checkout.create"
              className="w-full"
              disabled={busy || !lines.length || !warehouseId || paid < total}
              onClick={complete}
            >
              {busy ? t("pos.completing") : t("pos.completeSale")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function Summary({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${strong ? "text-lg font-bold" : ""}`}
    >
      <span>{label}</span>
      <span>{value.toLocaleString()} USD</span>
    </div>
  );
}
