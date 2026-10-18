import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  PackageSearch,
  Plus,
  UsersRound,
} from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type Page =
  "dashboard" | "staff" | "operation-types" | "storage" | "item-reduction";
type Operation = { id: string; name: string; status: string };
const headingKeys: Record<Page, string> = {
  dashboard: "icu.navDashboard",
  staff: "icu.navStaff",
  "operation-types": "icu.navOperationTypes",
  storage: "icu.navStorage",
  "item-reduction": "icu.navItemReduction",
};

export default function IcuModulePage({ page }: { page: Page }) {
  const { t, i18n } = useTranslation();
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Operation | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const loadingMoreProducts = useRef(false);
  const endpoint =
    page === "item-reduction" ? "/icu/item-reductions" : `/icu/${page}`;
  const resource = useApiResource(
    useCallback(
      async () =>
        (
          await apiClient.get(endpoint, {
            params: { page: 1, pageSize: 100, version },
          })
        ).data,
      [endpoint, version],
    ),
  );
  const recentCases = useApiResource(
    useCallback(
      async () =>
        (
          await apiClient.get("/icu/cases", {
            params: { page: 1, pageSize: 6 },
          })
        ).data,
      [],
    ),
  );
  const icuStorage = useApiResource(
    useCallback(async () => (await apiClient.get("/icu/storage")).data, []),
  );
  const products = useApiResource(
    useCallback(
      async () =>
        (
          await apiClient.get("/icu/products", {
            params: { page: productPage, pageSize: 30, search: productSearch },
          })
        ).data,
      [productPage, productSearch],
    ),
  );
  useEffect(() => {
    if (!products.data) return;
    const nextItems = products.data.items ?? [];
    setProductOptions((current) =>
      productPage === 1 ? nextItems : [...current, ...nextItems],
    );
    loadingMoreProducts.current = false;
  }, [products.data, productPage]);
  const data = resource.data as any;
  const items = Array.isArray(data)
    ? data
    : (data?.items ?? data?.data?.items ?? []);
  const refresh = () => setVersion((v) => v + 1);
  const recentRows = recentCases.data?.items ?? [];
  const stockRows = icuStorage.data?.items ?? [];
  const lowStock = stockRows
    .filter(
      (row: any) => row.reorderLevel > 0 && row.quantity <= row.reorderLevel,
    )
    .slice(0, 5);
  const cards = [
    {
      label: t("icu.ui.patientsInUnit"),
      value: data?.activeCases ?? "—",
      href: "/icu/cases",
      icon: BedDouble,
      note: t("icu.ui.currentlyAdmitted"),
      color: "text-rose-600 bg-rose-500/10",
    },
    {
      label: t("icu.ui.casesRecorded"),
      value: data?.totalCases ?? "—",
      href: "/icu/cases",
      icon: Activity,
      note: t("icu.ui.allAdmissions"),
      color: "text-sky-700 bg-sky-500/10",
    },
    {
      label: t("icu.ui.staffCount"),
      value: data?.staff ?? "—",
      href: "/icu/staff",
      icon: UsersRound,
      note: t("icu.ui.activeDepartmentStaff"),
      color: "text-violet-700 bg-violet-500/10",
    },
    {
      label: t("icu.ui.operationTypes"),
      value: data?.operations ?? "—",
      href: "/icu/operation-types",
      icon: HeartPulse,
      note: t("icu.ui.availableProcedures"),
      color: "text-emerald-700 bg-emerald-500/10",
    },
  ];
  const saveOperation = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (selected)
        await apiClient.patch(`/icu/operation-types/${selected.id}`, { name });
      else await apiClient.post("/icu/operation-types", { name });
      setOpen(false);
      setSelected(null);
      setName("");
      refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const reduceItem = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiClient.post("/icu/item-reductions", {
        productId,
        quantity: Number(quantity),
        date,
        notes,
      });
      toast.success(t("icu.ui.reductionRecorded"));
      setProductId("");
      setQuantity("1");
      setNotes("");
      refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="space-y-5 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t(headingKeys[page])}</h1>
          <p className="text-sm text-muted-foreground">
            {t("icu.ui.moduleSubtitle")}
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          {t("icu.ui.refresh")}
        </Button>
      </div>
      {resource.error && (
        <p role="alert" className="text-destructive">
          {resource.error}
        </p>
      )}
      {page === "dashboard" && (
        <div className="space-y-6">
          <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-700 px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9">
            <div className="absolute -end-12 -top-24 -z-10 size-72 rounded-full border-[36px] border-white/5" />
            <div className="absolute end-32 -bottom-28 -z-10 size-56 rounded-full bg-emerald-300/10 blur-2xl" />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <Badge className="mb-4 border-white/20 bg-white/10 text-white hover:bg-white/10">
                  <Activity className="me-1 size-3.5" />
                  {t("icu.ui.criticalCareOverview")}
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("icu.ui.operations")}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/85">
                  {t("icu.ui.overviewDescription")}
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-teal-50/75">
                  <CalendarDays className="size-4" />
                  {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date())}
                </div>
              </div>
              <Button
                asChild
                className="bg-white text-teal-900 shadow-md hover:bg-teal-50"
              >
                <Link to="/icu/cases">
                  <Plus className="size-4" />
                  {t("icu.ui.openCases")}
                </Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {cards.map(({ label, value, href, icon: Icon, note, color }) => (
              <Link key={label} to={href} className="group">
                <Card className="h-full border-border/70 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid size-11 place-items-center rounded-xl ${color}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground/60 transition-transform group-hover:-translate-x-1 group-hover:text-primary rtl:rotate-180" />
                  </div>
                  <p className="mt-5 text-sm font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </Card>
              </Link>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
            <Card className="overflow-hidden border-border/70">
              <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                  <h2 className="font-semibold">{t("icu.ui.recentCases")}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("icu.ui.latestActivity")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/icu/cases">
                  {t("icu.ui.viewAll")} <ArrowRight className="ms-1 size-4" />
                  </Link>
                </Button>
              </div>
              <div className="divide-y">
                {recentCases.isLoading ? (
                  <div className="space-y-3 p-5">
                    <div className="h-12 animate-pulse rounded-lg bg-muted" />
                    <div className="h-12 animate-pulse rounded-lg bg-muted" />
                    <div className="h-12 animate-pulse rounded-lg bg-muted" />
                  </div>
                ) : recentRows.length ? (
                  recentRows.map((row: any) => (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-600">
                          <HeartPulse className="size-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {row.patientName}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5" />
                            {t("icu.ui.admitted", { date: new Date(row.entry).toLocaleString(i18n.resolvedLanguage) })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={row.exit ? "secondary" : "default"}
                        className={row.exit ? "" : "bg-emerald-600"}
                      >
                        {row.exit ? t("icu.ui.discharged") : t("icu.ui.inUnit")}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
                      <BedDouble className="size-5 text-muted-foreground" />
                    </span>
                    <p className="mt-3 font-medium">{t("icu.ui.noCases")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("icu.ui.newAdmissions")}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-5">
              <Card className="border-border/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{t("icu.ui.supplyWatch")}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("icu.ui.lowStockDescription")}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-700">
                    <PackageSearch className="size-5" />
                  </span>
                </div>
                {lowStock.length ? (
                  <div className="mt-4 space-y-3">
                    {lowStock.map((row: any) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {row.product?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("icu.ui.reorderLevel", { level: row.reorderLevel })}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-amber-500/30 text-amber-700"
                        >
                          {t("icu.ui.remaining", { count: row.quantity })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-emerald-500/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="size-4" />
                      {t("icu.ui.noLowStock")}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {icuStorage.data?.warehouse
                        ? t("icu.ui.monitoringWarehouse", { name: icuStorage.data.warehouse.name })
                        : t("icu.ui.connectWarehouse")}
                    </p>
                  </div>
                )}
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to="/icu/storage">{t("icu.ui.viewStorage")}</Link>
                </Button>
              </Card>
              <Card className="border-border/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <UsersRound className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{t("icu.ui.careTeam")}</h2>
                    <p className="text-xs text-muted-foreground">
                      {t("icu.ui.staffingOverview")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{data?.staff ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("icu.ui.activeStaff")}
                    </p>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/icu/staff">{t("icu.ui.viewTeam")}</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        </div>
      )}
      {page === "staff" && (
        <Card className="p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {data?.department
              ? t("icu.ui.department", { name: data.department.name })
              : t("icu.ui.staffSetupHelp")}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("icu.ui.employee")}</TableHead>
                <TableHead>{t("icu.ui.code")}</TableHead>
                <TableHead>{t("icu.ui.position")}</TableHead>
                <TableHead>{t("icu.ui.staffType")}</TableHead>
                <TableHead>{t("icu.ui.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.employee?.firstName} {row.employee?.lastName}
                  </TableCell>
                  <TableCell>{row.employee?.employeeCode}</TableCell>
                  <TableCell>{row.employee?.position?.name ?? "—"}</TableCell>
                  <TableCell>
                    {row.staffType
                      ? t(String(row.staffType), {
                          defaultValue: String(row.staffType),
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {row.status
                      ? t(String(row.status), {
                          defaultValue: String(row.status),
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {page === "operation-types" && (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelected(null);
                setName("");
                setOpen(true);
              }}
            >
              {t("icu.ui.addOperationType")}
            </Button>
          </div>
          <Card className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>{t("icu.ui.operationType")}</TableHead>
                <TableHead>{t("icu.ui.status")}</TableHead>
                <TableHead>{t("icu.ui.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row: Operation) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {t(String(row.status), {
                        defaultValue: String(row.status),
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelected(row);
                          setName(row.name);
                          setOpen(true);
                        }}
                      >
                        {t("icu.ui.edit")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selected
                    ? t("icu.ui.editOperationType")
                    : t("icu.ui.addOperationType")}
                </DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={saveOperation}>
                <Label htmlFor="icu-operation-name">{t("icu.ui.name")}</Label>
                <Input
                  id="icu-operation-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={191}
                />
                <Button disabled={busy}>
                  {selected ? t("icu.ui.update") : t("icu.ui.create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
      {page === "storage" && (
        <Card className="p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {data?.warehouse
              ? t("icu.ui.warehouse", { name: data.warehouse.name })
              : t("icu.ui.noWarehouse")}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("icu.ui.product")}</TableHead>
                <TableHead>{t("icu.ui.sku")}</TableHead>
                <TableHead>{t("icu.ui.category")}</TableHead>
                <TableHead>{t("icu.ui.quantity")}</TableHead>
                <TableHead>{t("icu.ui.unit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.product?.name}</TableCell>
                  <TableCell>{row.product?.sku}</TableCell>
                  <TableCell>{row.product?.category?.name ?? "—"}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.product?.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {page === "item-reduction" && (
        <>
          <Card className="p-5">
            <form
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              onSubmit={reduceItem}
            >
              <div className="space-y-2">
                <Label htmlFor="icu-reduction-product">{t("icu.ui.product")}</Label>
                <Popover
                  open={productPickerOpen}
                  onOpenChange={setProductPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id="icu-reduction-product"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={productPickerOpen}
                      className="w-full justify-between font-normal"
                    >
                      {(productOptions.find((row) => row.id === productId)
                        ?.name ??
                        productId) ||
                        t("icu.ui.selectProduct")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] p-2"
                  >
                    <Input
                      value={productSearch}
                      placeholder={t("icu.ui.searchProducts")}
                      onChange={(event) => {
                        setProductSearch(event.target.value);
                        setProductPage(1);
                        setProductOptions([]);
                        loadingMoreProducts.current = false;
                      }}
                      aria-label={t("icu.ui.searchProducts")}
                    />
                    <ScrollArea
                      className="my-2 h-56"
                      onScrollCapture={(event) => {
                        const viewport = event.target as HTMLElement;
                        if (
                          viewport.hasAttribute(
                            "data-radix-scroll-area-viewport",
                          ) &&
                          viewport.scrollHeight -
                            viewport.scrollTop -
                            viewport.clientHeight <
                            80 &&
                          !products.isLoading &&
                          !loadingMoreProducts.current &&
                          productPage <
                            (products.data?.pagination?.totalPages ?? 1)
                        ) {
                          loadingMoreProducts.current = true;
                          setProductPage((current) => current + 1);
                        }
                      }}
                    >
                      <div className="space-y-1">
                        {productOptions.map((row) => (
                          <Button
                            key={row.id}
                            type="button"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setProductId(row.id);
                              setProductPickerOpen(false);
                            }}
                          >
                            {row.name} ({row.quantity})
                          </Button>
                        ))}
                        {!productOptions.length && (
                          <p className="p-3 text-sm text-muted-foreground">
                            {products.isLoading
                              ? t("icu.ui.loadingProducts")
                              : t("icu.ui.noProductsFound")}
                          </p>
                        )}
                        {products.isLoading && productOptions.length > 0 && (
                          <p className="p-2 text-center text-xs text-muted-foreground">
                            {t("icu.ui.loadingMoreProducts")}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <p className="border-t pt-2 text-center text-xs text-muted-foreground">
                      {t("icu.ui.paginationHint", {
                        page: products.data?.pagination?.page ?? productPage,
                        totalPages: products.data?.pagination?.totalPages ?? 1,
                      })}
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icu-reduction-qty">{t("icu.ui.quantity")}</Label>
                <Input
                  id="icu-reduction-qty"
                  type="number"
                  min="0.001"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("icu.ui.date")}</Label>
                <FormDatePicker value={date} onValueChange={setDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icu-reduction-notes">{t("icu.ui.notes")}</Label>
                <Input
                  id="icu-reduction-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                className="sm:col-span-2 xl:col-span-4"
                disabled={busy || !productId}
              >
                {t("icu.ui.recordReduction")}
              </Button>
            </form>
          </Card>
          <Card className="p-4">
            <h2 className="mb-3 font-semibold">{t("icu.ui.recentReductions")}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("icu.ui.date")}</TableHead>
                  <TableHead>{t("icu.ui.product")}</TableHead>
                  <TableHead>{t("icu.ui.quantity")}</TableHead>
                  <TableHead>{t("icu.ui.notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {new Date(row.occurredAt).toLocaleDateString(i18n.resolvedLanguage)}
                    </TableCell>
                    <TableCell>{row.product?.name}</TableCell>
                    <TableCell>{Math.abs(row.quantity)}</TableCell>
                    <TableCell>{row.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </main>
  );
}
