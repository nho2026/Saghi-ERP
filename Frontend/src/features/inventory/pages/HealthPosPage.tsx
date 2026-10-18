import { useServerTable } from "@/shared/hooks/useServerTable";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";
import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Barcode,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  RotateCcw,
  LayoutGrid,
  List,
  Moon,
  Sun,
  UserRound,
  Package,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import defaultLogo from "@/assets/icons/logo.png";
import { useSettings } from "@/features/settings/settings";
import {
  inventoryApi,
  posApi,
  productImageUrl,
  type RecordItem,
} from "../api/inventory.api";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { printPosInvoice } from "../components/logic/print-pos-invoice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTheme } from "@/shared/hooks/useTheme";
import { WindowControls } from "@/shared/components/WindowControls";
import { isCashier, storedUser } from "@/features/auth/access";

export default function HealthPosPage() {
  const systemSettings = useSettings();
  const logo = systemSettings?.organization.logo || defaultLogo;
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const cashier = isCashier(storedUser());
  const [products, setProducts] = useState<RecordItem[]>([]),
    [warehouses, setWarehouses] = useState<RecordItem[]>([]),
    [warehouseId, setWarehouse] = useState(""),
    [cart, setCart] = useState<Record<string, number>>({}),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [payment, setPayment] = useState("cash"),
    [discount, setDiscount] = useState(0),
    [paid, setPaid] = useState(0),
    [busy, setBusy] = useState(false);
  const [lastSale, setLastSale] = useState<RecordItem | null>(null),
    [returnOpen, setReturnOpen] = useState(false),
    [returnCode, setReturnCode] = useState("");
  const [printFormat, setPrintFormat] = useState<"a4" | "receipt">("a4");
  const [catalogView, setCatalogView] = useState<"grid" | "table">("grid");
  const scanner = useRef({ value: "", at: 0 });
  const [categories, setCategories] = useState<RecordItem[]>([]);
  const catalog = useServerTable<RecordItem>("/inventory/products", {
    search,
    categoryId: category === "all" ? undefined : category,
    warehouseId: warehouseId || undefined,
    status: "active",
  });
  const load = catalog.refresh;
  useEffect(() => {
    let active = true;
    void Promise.all([
      inventoryApi.all("warehouses"),
      inventoryApi.all("categories"),
    ])
      .then(([w, c]) => {
        if (!active) return;
        setWarehouses(w.filter((x) => x.status === "active"));
        setCategories(c);
        setWarehouse((v) => v || w[0]?.id || "");
      })
      .catch((error) => toast.error(apiErrorMessage(error)));
    return () => {
      active = false;
    };
  }, []);
  const stock = (p: RecordItem) =>
    p.stocks?.find((s: RecordItem) => s.warehouseId === warehouseId)
      ?.quantity ?? 0;
  const price = (p: RecordItem) => {
    const now = Date.now(),
      active =
        p.discountType &&
        Number(p.discountValue) > 0 &&
        (!p.discountStart || new Date(p.discountStart).getTime() <= now) &&
        (!p.discountEnd || new Date(p.discountEnd).getTime() >= now);
    if (!active) return Number(p.sellingPrice);
    return p.discountType === "percentage"
      ? Number(p.sellingPrice) *
          (1 - Math.min(Number(p.discountValue), 100) / 100)
      : Math.max(0, Number(p.sellingPrice) - Number(p.discountValue));
  };
  const discounted = (p: RecordItem) => price(p) < Number(p.sellingPrice);
  const mainImage = (p: RecordItem) =>
    p.images?.find((image: RecordItem) => image.isMain)?.imageUrl ??
    p.images?.[0]?.imageUrl;
  const add = (p: RecordItem) => {
    setProducts((current) => [
      ...current.filter((item) => item.id !== p.id),
      p,
    ]);
    if (!stock(p)) return toast.error(t("pos.outOfStock"));
    setCart((c) => ({ ...c, [p.id]: Math.min((c[p.id] ?? 0) + 1, stock(p)) }));
  };
  const scan = async (code: string) => {
    if (!code) return;
    try {
      const result = await inventoryApi.list("products", 1, {
        exactCode: code,
        status: "active",
        warehouseId,
      });
      const p = result.items.find((x) => x.barcode === code || x.sku === code);
      if (p) {
        add(p);
        toast.success(t("pos.scanned", { name: p.name }));
      } else toast.error(t("pos.barcodeNotFound"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches(
          "input,textarea,[contenteditable=true]",
        )
      )
        return;
      const now = Date.now();
      if (now - scanner.current.at > 100) scanner.current.value = "";
      scanner.current.at = now;
      if (e.key === "Enter") {
        scan(scanner.current.value);
        scanner.current.value = "";
      } else if (e.key.length === 1) scanner.current.value += e.key;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [products, warehouseId]);
  const lines = Object.entries(cart)
      .map(([id, quantity]) => ({
        product: products.find((p) => p.id === id)!,
        quantity,
      }))
      .filter((x) => x.product),
    subtotal = lines.reduce((s, x) => s + price(x.product) * x.quantity, 0),
    tax = lines.reduce(
      (s, x) => s + (price(x.product) * x.quantity * x.product.taxRate) / 100,
      0,
    ),
    total = Math.max(0, subtotal + tax - discount);
  useEffect(() => {
    setPaid(total);
  }, [total, payment]);
  const visible = catalog.data ?? [];
  const complete = async () => {
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    setBusy(true);
    try {
      const sale = await posApi.create({
        warehouseId,
        paymentMethod: payment,
        discountAmount: discount,
        paidAmount: paid,
        items: lines.map((x) => ({
          productId: x.product.id,
          quantity: x.quantity,
        })),
      });
      setLastSale(sale);
      printPosInvoice(sale, t, printWindow, printFormat);
      toast.success(t("pos.completed"));
      setCart({});
      setDiscount(0);
      setPaid(0);
      await load();
    } catch (e) {
      printWindow?.close();
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="h-svh overflow-hidden bg-background">
      <header className="electron-titlebar relative flex h-16 items-center justify-between gap-3 border-b border-primary/15 bg-card px-4 shadow-[0_4px_20px_-16px_var(--primary)] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-linear-to-r before:from-primary before:via-teal-400 before:to-teal-400">
        <Link
          to={cashier ? "/profile" : "/dashboard"}
          className="grid size-9 place-items-center rounded-lg border border-primary/20 bg-primary/5 text-primary transition hover:bg-primary/12"
        >
          {cashier ? (
            <UserRound className="size-4" />
          ) : (
            <ArrowLeft className="size-4 rtl:rotate-180" />
          )}
        </Link>
        <img
          src={logo}
          alt={systemSettings?.organization.name || ""}
          className="size-10 rounded-xl border border-primary/15 bg-white object-contain shadow-sm"
        />
        <div className="hidden sm:block">
          <b className="text-primary">
            {systemSettings?.organization.name || ""}
          </b>
          <small className="block text-muted-foreground">
            {t("pos.cashierWorkspace")}
          </small>
        </div>
        <div className="relative mx-auto hidden w-full max-w-lg md:block">
          <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <Input
            className="border-primary/20 bg-primary/4 ps-9 text-foreground shadow-sm focus-visible:bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pos.searchProducts")}
          />
        </div>
        <Select
          value={warehouseId}
          onValueChange={(v) => {
            setWarehouse(v);
            setCart({});
          }}
        >
          <SelectTrigger className="w-44 border-primary/20 bg-card text-primary shadow-sm">
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
        <Button
          permission="pos.sales.return"
          className="border-primary/25 bg-primary/5 text-primary hover:bg-primary/12 hover:text-primary"
          variant="outline"
          onClick={() => setReturnOpen(true)}
        >
          <RotateCcw />
          {t("pos.returnSale")}
        </Button>
        <Button
          className="border-primary/25 bg-primary/5 text-primary hover:bg-primary/12"
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          title={theme === "dark" ? "Use light mode" : "Use dark mode"}
          aria-label={theme === "dark" ? "Use light mode" : "Use dark mode"}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <WindowControls />
      </header>
      <main className="grid h-[calc(100svh-4rem)] xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0 overflow-y-auto bg-[radial-gradient(circle_at_top,var(--accent),transparent_28%)] p-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              scan(String(new FormData(form).get("barcode") ?? ""));
              form.reset();
            }}
          >
            <div className="relative flex-1">
              <Barcode className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                name="barcode"
                className="ps-9"
                autoFocus
                autoComplete="off"
                placeholder={t("pos.scanBarcode")}
              />
            </div>
            <Button>{t("pos.addBarcode")}</Button>
          </form>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
              <Button
                type="button"
                variant={category === "all" ? "default" : "outline"}
                onClick={() => setCategory("all")}
              >
                {t("pos.allProducts")}
              </Button>
              {categories.map((c) => (
                <Button
                  type="button"
                  key={c.id}
                  variant={category === c.id ? "default" : "outline"}
                  onClick={() => setCategory(c.id)}
                >
                  {c.name}
                </Button>
              ))}
            </div>
            <div className="flex shrink-0 rounded-lg border border-primary/20 bg-primary/8 p-1">
              <Button
                size="icon"
                variant={catalogView === "grid" ? "default" : "ghost"}
                title={t("pos.gridView")}
                onClick={() => setCatalogView("grid")}
              >
                <LayoutGrid />
              </Button>
              <Button
                size="icon"
                variant={catalogView === "table" ? "default" : "ghost"}
                title={t("pos.tableView")}
                onClick={() => setCatalogView("table")}
              >
                <List />
              </Button>
            </div>
          </div>
          {catalogView === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visible.map((p) => (
                <Button
                  variant="outline"
                  type="button"
                  key={p.id}
                  disabled={!stock(p)}
                  onClick={() => add(p)}
                  className="group relative flex h-auto min-w-0 items-stretch whitespace-normal p-0 flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card text-start shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-100"
                >
                  <div className="relative h-28 w-full shrink-0 overflow-hidden border-b border-primary/10 bg-white dark:bg-slate-100">
                    {mainImage(p) ? (
                      <img
                        src={productImageUrl(mainImage(p))}
                        alt={p.name}
                        className="size-full object-contain p-3 transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center bg-linear-to-br from-slate-50 to-slate-100">
                        <span className="grid size-16 place-items-center rounded-2xl border border-primary/10 bg-white text-primary/45 shadow-sm">
                          <Package className="size-8 transition group-hover:scale-110 group-hover:text-primary" />
                        </span>
                      </div>
                    )}
                    <span className="absolute end-2.5 top-2.5 whitespace-nowrap rounded-full border border-white/20 bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur">
                      {stock(p)} {t("inventory.fields.stock")}
                    </span>
                    {discounted(p) && (
                      <span className="absolute inset-s-2.5 top-2.5 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                        {p.discountType === "percentage"
                          ? `-${p.discountValue}%`
                          : `-${Number(p.discountValue).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  <div className="flex w-full flex-1 flex-col p-3.5">
                    <small className="truncate font-medium text-primary/70">
                      {p.category?.name ?? p.sku}
                    </small>
                    <b className="mt-1 line-clamp-2 min-h-10 leading-5">
                      {p.name}
                    </b>
                    <span className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Barcode className="size-3" />
                      {p.barcode || p.sku}
                    </span>
                    <div className="mt-auto flex items-end justify-between gap-2 border-t border-primary/10 pt-3">
                      <span className="flex min-w-0 flex-col">
                        <strong className="text-base text-primary">
                          {price(p).toLocaleString()} USD
                        </strong>
                        {discounted(p) && (
                          <small className="text-muted-foreground line-through">
                            {Number(p.sellingPrice).toLocaleString()}
                          </small>
                        )}
                      </span>
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-full ${stock(p) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        <Plus className="size-4" />
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden rounded-xl border border-primary/20 bg-card">
              <Table className="w-full text-sm">
                <TableHeader className="bg-primary/10 text-primary">
                  <TableRow>
                    <TableHead className="p-3 text-start">
                      {t("pos.image")}
                    </TableHead>
                    <TableHead className="p-3 text-start">
                      {t("inventory.fields.product")}
                    </TableHead>
                    <TableHead className="p-3 text-start">
                      {t("inventory.fields.sku")}
                    </TableHead>
                    <TableHead className="p-3 text-start">
                      {t("inventory.fields.barcode")}
                    </TableHead>
                    <TableHead className="p-3 text-start">
                      {t("inventory.fields.category")}
                    </TableHead>
                    <TableHead className="p-3 text-end">
                      {t("inventory.fields.sellingPrice")}
                    </TableHead>
                    <TableHead className="p-3 text-end">
                      {t("inventory.fields.stock")}
                    </TableHead>
                    <TableHead className="p-3 text-end">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {visible.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-t hover:bg-primary/5"
                    >
                      <TableCell className="p-2">
                        {mainImage(p) ? (
                          <img
                            src={productImageUrl(mainImage(p))}
                            alt=""
                            className="size-11 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="grid size-11 place-items-center rounded-lg bg-muted">
                            <ShoppingCart className="size-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-3 font-semibold">
                        {p.name}
                      </TableCell>
                      <TableCell className="p-3 font-mono text-xs">
                        {p.sku}
                      </TableCell>
                      <TableCell className="p-3 font-mono text-xs">
                        <span className="flex items-center gap-2">
                          <Barcode className="size-4 text-primary" />
                          {p.barcode}
                        </span>
                      </TableCell>
                      <TableCell className="p-3">
                        {p.category?.name ?? "—"}
                      </TableCell>
                      <TableCell className="p-3 text-end font-semibold">
                        <span className="font-semibold text-primary">
                          {price(p).toLocaleString()} USD
                        </span>
                        {discounted(p) && (
                          <span className="ms-2 text-xs text-muted-foreground line-through">
                            {Number(p.sellingPrice).toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-end">{stock(p)}</TableCell>
                      <TableCell className="p-3 text-end">
                        <Button
                          size="sm"
                          disabled={!stock(p)}
                          onClick={() => add(p)}
                        >
                          <Plus />
                          {t("pos.addBarcode")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          {catalog.error && (
            <p role="alert" className="text-destructive">
              {catalog.error}
            </p>
          )}
          <PaginationControls {...catalog.pagination} />
        </section>
        <aside className="flex min-h-0 flex-col border-s border-primary/20 bg-card shadow-[-8px_0_24px_-24px_var(--primary)]">
          <div className="border-b border-primary/15 bg-linear-to-e from-primary/10 to-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShoppingCart className="size-8 rounded-lg bg-primary p-1.5 text-primary-foreground shadow-sm" />
              {t("pos.cart")}
              <span className="ms-auto rounded-full bg-primary px-2.5 py-0.5 text-xs text-primary-foreground shadow-sm">
                {lines.reduce((s, x) => s + x.quantity, 0)}
              </span>
            </h2>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
            {!lines.length && (
              <p className="mx-2 rounded-2xl border border-dashed border-primary/20 bg-primary/3 py-16 text-center text-sm text-muted-foreground">
                {t("pos.emptyCart")}
              </p>
            )}
            {lines.map(({ product, quantity }) => (
              <Card
                key={product.id}
                className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-card p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                {mainImage(product) ? (
                  <img
                    src={productImageUrl(mainImage(product))}
                    alt={product.name}
                    className="size-12 shrink-0 rounded-xl border border-primary/10 bg-white object-contain p-1"
                  />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-primary/10 bg-primary/8 text-primary/55">
                    <Package className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-sm leading-5">
                    {product.name}
                  </b>
                  <small className="mt-0.5 block font-semibold text-primary">
                    {(price(product) * quantity).toLocaleString()} USD
                  </small>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 p-1 shadow-inner">
                  <Button
                    permission="view"
                    data-action="delete"
                    className={`size-8 rounded-lg ${quantity === 1 ? "text-destructive hover:bg-destructive hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    size="icon"
                    variant="ghost"
                    title={quantity === 1 ? t("common.delete") : undefined}
                    onClick={() =>
                      setCart((current) => {
                        const next = { ...current };
                        if (quantity === 1) delete next[product.id];
                        else next[product.id] = quantity - 1;
                        return next;
                      })
                    }
                  >
                    {quantity === 1 ? (
                      <Trash2 className="size-4" />
                    ) : (
                      <Minus className="size-4" />
                    )}
                  </Button>
                  <strong className="min-w-7 text-center text-sm tabular-nums">
                    {quantity}
                  </strong>
                  <Button
                    className="size-8 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    size="icon"
                    disabled={quantity >= stock(product)}
                    onClick={() => add(product)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-3 border-t border-primary/20 bg-linear-to-b from-primary/4 to-card p-5 shadow-[0_-8px_24px_-20px_var(--primary)]">
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
            <div className="grid grid-cols-3 gap-2">
              {["cash", "card", "bank_transfer"].map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={payment === method ? "default" : "outline"}
                  onClick={() => setPayment(method)}
                >
                  {t(`pos.values.${method}`)}
                </Button>
              ))}
            </div>
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
            <div className="flex gap-2">
              <Select
                value={printFormat}
                onValueChange={(value) =>
                  setPrintFormat(value as "a4" | "receipt")
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">{t("pos.a4Invoice")}</SelectItem>
                  <SelectItem value="receipt">
                    {t("pos.thermalReceipt")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                permission="pos.sales.print"
                variant="outline"
                size="icon"
                disabled={!lastSale}
                onClick={() =>
                  lastSale &&
                  printPosInvoice(lastSale, t, undefined, printFormat)
                }
              >
                <Printer />
              </Button>
              <Button
                permission="pos.checkout.create"
                className="flex-1 shadow-md shadow-primary/20"
                disabled={busy || !lines.length || !warehouseId || paid < total}
                onClick={complete}
              >
                {busy ? t("pos.completing") : t("pos.completeSale")}
              </Button>
            </div>
          </div>
        </aside>
      </main>
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pos.returnSale")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("pos.returnDescription")}
          </p>
          <div className="relative">
            <Barcode className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              className="ps-9"
              value={returnCode}
              onChange={(e) => setReturnCode(e.target.value)}
              placeholder={t("pos.invoiceBarcode")}
            />
          </div>
          <Button
            permission="pos.sales.return"
            disabled={!returnCode || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await posApi.returnByNumber(returnCode.trim());
                toast.success(t("pos.returnCompleted"));
                setReturnOpen(false);
                setReturnCode("");
                await load();
              } catch (e) {
                toast.error(apiErrorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            <RotateCcw />
            {t("pos.confirmReturn")}
          </Button>
        </DialogContent>
      </Dialog>
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
