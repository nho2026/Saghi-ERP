import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FlaskConical,
  Plus,
  RefreshCw,
  Eye,
  ArrowRightLeft,
  FileUp,
  Printer,
  CreditCard,
} from "lucide-react";
import { apiErrorMessage } from "@/shared/api/client";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { randomId } from "@/shared/lib/random-id";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { labApi, type LabOrder } from "../api";
import { ReceptionForm } from "../components/ReceptionForm";
import { printLaboratory } from "../print";
import { LaboratoryProgress } from "../components/LaboratoryProgress";
import { progressStages, nextStage, stageStyles } from "../workflow";

export default function LaboratoryPage({
  mode = "reception",
}: {
  mode?:
    "reception" | "accounting" | "queue" | "received" | "completed" | "room";
}) {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const user = storedUser();
  const canCreate = hasPermission(user, "laboratory.orders.create");
  const canPay = hasPermission(user, "laboratory.payments.create");
  const canWork = hasPermission(user, "laboratory.orders.update");
  const canPrint = hasPermission(user, "laboratory.orders.print");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(
    progressStages.includes(params.get("stage") ?? "")
      ? params.get("stage")!
      : "",
  );
  const [creating, setCreating] = useState(
    canCreate &&
      mode === "reception" &&
      Boolean(
        params.get("patientId") ||
        params.get("leadId") ||
        params.get("appointmentId"),
      ),
  );
  const [selected, setSelected] = useState<LabOrder | null>(null);
  const queuePosition = useApiResource(
    useCallback(async () => {
      if (mode !== "reception" || !selected) return null;
      return labApi.queuePosition(selected.id);
    }, [mode, selected]),
  );
  const [amount, setAmount] = useState("");
  const refreshQueuePosition = queuePosition.refresh;
  useEffect(() => {
    if (mode !== "reception" || !selected) return;
    const timer = window.setInterval(() => void refreshQueuePosition(), 20000);
    return () => window.clearInterval(timer);
  }, [mode, selected, refreshQueuePosition]);
  const [method, setMethod] = useState("cash");
  const [results, setResults] = useState<
    Record<string, { result: string; resultNotes: string }>
  >({});
  const [error, setError] = useState("");
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const paymentId = useRef(randomId());
  const config = useApiResource(useCallback(() => labApi.config(), []));
  const table = useServerTable<LabOrder>("/laboratory/orders", {
    search,
    status,
    queue: mode === "queue" || mode === "room" ? "true" : undefined,
    received: mode === "received" ? "true" : undefined,
    completed: mode === "completed" ? "true" : undefined,
    patientId:
      mode === "reception" ? (params.get("patientId") ?? undefined) : undefined,
    leadId:
      mode === "reception" ? (params.get("leadId") ?? undefined) : undefined,
    appointmentId:
      mode === "reception"
        ? (params.get("appointmentId") ?? undefined)
        : undefined,
  });
  const requestedOrder = params.get("orderId");
  useEffect(() => {
    if (!["accounting", "completed"].includes(mode) || !requestedOrder) return;
    let active = true;
    void labApi
      .getOrder(requestedOrder)
      .then((order) => {
        if (!active) return;
        setSelected(order);
        setAmount(String(order.invoice.balanceAmount));
        setResults(
          Object.fromEntries(
            order.items.map((item) => [
              item.id,
              {
                result: item.result ?? "",
                resultNotes: item.resultNotes ?? "",
              },
            ]),
          ),
        );
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [mode, requestedOrder]);
  const refreshOrders = table.refresh;
  useEffect(() => {
    if (mode === "reception" || selected) return;
    const timer = window.setInterval(() => {
      void refreshOrders();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [mode, selected, refreshOrders]);
  const stages =
    mode === "completed"
      ? ["completed"]
      : mode === "received"
        ? ["received", "called", "delivered"]
        : mode === "queue" || mode === "room"
          ? ["waiting", "collecting", "processing"]
          : [
              "awaiting_payment",
              "waiting",
              "collecting",
              "processing",
              "completed",
              "received",
              "called",
              "delivered",
            ];
  const money = (value: number | string) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(
      Number(value),
    );
  const openOrder = (order: LabOrder) => {
    setSelected(order);
    setError("");
    setAmount(String(order.invoice.balanceAmount));
    setMethod(config.data?.paymentMethods[0] ?? "cash");
    paymentId.current = randomId();
    setResults(
      Object.fromEntries(
        order.items.map((item) => [
          item.id,
          { result: item.result ?? "", resultNotes: item.resultNotes ?? "" },
        ]),
      ),
    );
  };
  const run = async (action: () => Promise<LabOrder>) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const order = await action();
      openOrder(order);
      await table.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const updateTableStatus = async (order: LabOrder, status: string) => {
    if (status === "received" && order.status === "completed") {
      openOrder(order);
      return;
    }
    if (status === "completed" && order.status === "processing") {
      openOrder(order);
      return;
    }
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await labApi.stage(order.id, status);
      await table.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const openAttachment = async (
    file: NonNullable<LabOrder["attachments"]>[number],
    preview: boolean,
  ) => {
    if (!selected) return;
    const viewer = preview ? window.open("about:blank", "_blank") : null;
    if (viewer) viewer.opener = null;
    try {
      const blob = await labApi.attachment(selected.id, file.id);
      const url = URL.createObjectURL(blob);
      if (viewer) viewer.location.href = url;
      else {
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (cause) {
      viewer?.close();
      setError(apiErrorMessage(cause));
    }
  };
  const print = async (
    kind: "ticket" | "invoice" | "results",
    order: LabOrder | null = selected,
  ) => {
    if (!order) return;
    try {
      await printLaboratory(
        order,
        Object.fromEntries(
          [
            "title",
            "popupBlocked",
            "goAccounting",
            "goLaboratory",
            "total",
            "queueNumber",
            "invoice",
            "results",
            "test",
            "result",
            "price",
            "referenceRange",
            "balance",
            "paidAmount",
            "ticket",
            "phone",
            "date",
            "address",
            "returnBarcodeHelp",
            "ticketsAhead",
            "accounting",
            "queue",
          ].map((key) => [key, t(`laboratory.${key}`)]),
        ),
        i18n.dir(),
        kind,
        i18n.language,
      );
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };
  return (
    <div className="w-full min-w-0 space-y-5 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FlaskConical className="text-primary" />
            {t("laboratory.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`laboratory.${mode}Hint`)}
          </p>
        </div>
        {mode === "reception" && canCreate && (
          <Button
            permission="laboratory.orders.create"
            onClick={() => setCreating(true)}
          >
            <Plus className="size-4" />
            {t("laboratory.newRequest")}
          </Button>
        )}
      </header>
      {table.error && (
        <p role="alert" className="text-sm text-destructive">
          {table.error}
        </p>
      )}
      {error && !selected && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Card className="overflow-hidden rounded-2xl">
        <div className="flex flex-wrap gap-3 p-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("laboratory.searchRequests")}
            aria-label={t("laboratory.searchRequests")}
            className="w-full sm:w-80"
          />
          <Select
            value={status || "all"}
            onValueChange={(next) => setStatus(next === "all" ? "" : next)}
          >
            <SelectTrigger
              className="w-full sm:w-56"
              aria-label={t("laboratory.status")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("laboratory.allStages")}</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {t(`laboratory.${stage}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("laboratory.refresh")}
            disabled={table.isLoading}
            onClick={() => {
              void table.refresh();
            }}
          >
            <RefreshCw className="size-4" />
          </Button>
          {params.size > 0 && (
            <Button variant="ghost" onClick={() => setParams({})}>
              {t("inventory.clearFilters")}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "queueNumber",
                  "patient",
                  "invoice",
                  "total",
                  ...(mode === "accounting" ? ["paidAmount"] : []),
                  "balance",
                  "status",
                  "progress",
                  "actions",
                ].map((key) => (
                  <TableHead key={key}>{t(`laboratory.${key}`)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody {...table.tableProps}>
              <TableResourceState
                isLoading={table.isLoading}
                error={table.error}
                isEmpty={!table.data?.length}
                colSpan={mode === "accounting" ? 9 : 8}
              />
              {table.data?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <p className="text-xl font-bold tabular-nums">
                      {order.queueNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.queueDay}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Link
                      className="font-medium text-primary hover:underline"
                      to={`/crm/patients/${order.patient.id}`}
                    >
                      {order.patient.firstName} {order.patient.lastName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {order.patient.patientCode}
                    </p>
                  </TableCell>
                  <TableCell>{order.invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    {money(order.invoice.totalAmount)} {order.invoice.currency}
                  </TableCell>
                  {mode === "accounting" && (
                    <TableCell>
                      {money(order.invoice.paidAmount)} {order.invoice.currency}
                    </TableCell>
                  )}
                  <TableCell>{money(order.invoice.balanceAmount)}</TableCell>
                  <TableCell>
                    {canWork &&
                    ["room", "completed", "received"].includes(mode) &&
                    nextStage[order.status] &&
                    order.invoice.status === "paid" ? (
                      <Select
                        value={order.status}
                        disabled={busy}
                        onValueChange={(value) =>
                          void updateTableStatus(order, value)
                        }
                      >
                        <SelectTrigger
                          className={`w-48 font-semibold shadow-none ${stageStyles[order.status]?.badge ?? ""}`}
                          aria-label={t("laboratory.updateStatus")}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                          <SelectItem value={order.status}>
                            {t(`laboratory.${order.status}`)}
                          </SelectItem>
                          <SelectItem
                            value={
                              mode === "room" && order.status === "waiting"
                                ? "processing"
                                : nextStage[order.status]
                            }
                          >
                            {t(
                              `laboratory.${mode === "room" && order.status === "waiting" ? "processing" : nextStage[order.status]}`,
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={stageStyles[order.status]?.badge}
                        variant={
                          order.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {t(`laboratory.${order.status}`)}
                      </Badge>
                    )}
                    {order.invoice.status === "cancelled" && (
                      <Badge variant="destructive">
                        {t("laboratory.cancelled")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <LaboratoryProgress status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("laboratory.view")}
                        title={t("laboratory.view")}
                        className="border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-200 hover:text-sky-800 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 dark:hover:text-sky-200"
                        onClick={() => openOrder(order)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {mode === "accounting" &&
                        canPay &&
                        order.invoice.status === "paid" && (
                          <Button
                            permission="laboratory.payments.create"
                            variant="outline"
                            disabled
                            className="shrink-0 border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            <CreditCard className="size-4" />
                            {t("laboratory.paid")}
                          </Button>
                        )}
                      {mode === "accounting" &&
                        canPay &&
                        Number(order.invoice.balanceAmount) > 0 &&
                        !["draft", "cancelled"].includes(
                          order.invoice.status,
                        ) && (
                          <Button
                            permission="laboratory.payments.create"
                            variant="outline"
                            disabled={
                              busy || config.isLoading || Boolean(config.error)
                            }
                            className="shrink-0 border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-200"
                            onClick={() => {
                              openOrder(order);
                              setConfirmPayment(true);
                            }}
                          >
                            <CreditCard className="size-4" />
                            {t("laboratory.payNow")}
                          </Button>
                        )}
                      {mode === "reception" && canPrint && (
                        <Button
                          permission="laboratory.orders.print"
                          variant="outline"
                          size="icon"
                          aria-label={t("laboratory.printTicket")}
                          title={t("laboratory.printTicket")}
                          className="border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-200"
                          disabled={busy}
                          onClick={() => void print("ticket", order)}
                        >
                          <Printer className="size-4" />
                        </Button>
                      )}
                      {canWork &&
                        ["queue", "room", "completed", "received"].includes(
                          mode,
                        ) && (
                          <DropdownMenu dir={i18n.dir()}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                permission="laboratory.orders.update"
                                variant="outline"
                                size="icon"
                                aria-label={t("laboratory.updateStatus")}
                                title={t("laboratory.updateStatus")}
                                className="border-violet-300 bg-violet-100 text-violet-700 hover:bg-violet-200 hover:text-violet-800 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900 dark:hover:text-violet-200"
                                disabled={
                                  busy ||
                                  !nextStage[order.status] ||
                                  order.invoice.status !== "paid"
                                }
                              >
                                <ArrowRightLeft className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {t("laboratory.updateStatus")}
                              </DropdownMenuLabel>
                              {nextStage[order.status] && (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    void updateTableStatus(
                                      order,
                                      mode === "room" &&
                                        order.status === "waiting"
                                        ? "processing"
                                        : nextStage[order.status],
                                    )
                                  }
                                >
                                  {t(
                                    `laboratory.${mode === "room" && order.status === "waiting" ? "processing" : nextStage[order.status]}`,
                                  )}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <Dialog
        open={creating}
        onOpenChange={(open) => {
          if (!open && !busy) setCreating(false);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>{t("laboratory.newRequest")}</DialogTitle>
            <DialogDescription>
              {t("laboratory.receptionHint")}
            </DialogDescription>
          </DialogHeader>
          <ReceptionForm
            onBusy={setBusy}
            onSaved={(order) => {
              setCreating(false);
              openOrder(order);
              void table.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSelected(null);
            setError("");
          }
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-3xl bg-background p-0 sm:max-w-5xl"
        >
          <DialogHeader className="shrink-0 border-b px-6 py-5 pe-12">
            <DialogTitle>
              {t("laboratory.request")} · {selected?.invoice.invoiceNumber}
            </DialogTitle>
            <DialogDescription>
              {selected?.patient.firstName} {selected?.patient.lastName} ·{" "}
              {t("laboratory.queueNumber")} {selected?.queueNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="sidebar-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
            {selected && (
              <>
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}
                <section className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold">
                        {selected.patient.firstName} {selected.patient.lastName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selected.patient.patientCode} ·{" "}
                        {selected.patient.phone}
                      </p>
                    </div>
                    <Badge
                      className={`px-3 py-1.5 ${stageStyles[selected.status]?.badge ?? ""}`}
                    >
                      {t(`laboratory.${selected.status}`)}
                    </Badge>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "queueNumber",
                        value: String(selected.queueNumber).padStart(3, "0"),
                      },
                      {
                        label: "invoice",
                        value: selected.invoice.invoiceNumber,
                      },
                      ...(mode === "reception"
                        ? [
                            {
                              label: "address",
                              value: selected.patient.address || "—",
                            },
                          ]
                        : [
                            {
                              label: "balance",
                              value: `${money(selected.invoice.balanceAmount)} ${selected.invoice.currency}`,
                            },
                          ]),
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl bg-muted/50 p-3"
                      >
                        <p className="text-xs text-muted-foreground">
                          {t(`laboratory.${item.label}`)}
                        </p>
                        <p className="mt-1 font-semibold tabular-nums">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
                {mode === "reception" && (
                  <section className="overflow-x-auto rounded-2xl border bg-card p-3">
                    <LaboratoryProgress status={selected.status} />
                    {queuePosition.data?.active && (
                      <p
                        className="px-2 pb-2 text-sm font-semibold"
                        role="status"
                      >
                        {t(
                          queuePosition.data.queue === "accounting"
                            ? "laboratory.accounting"
                            : "laboratory.queue",
                        )}{" "}
                        · {t("laboratory.ticketsAhead")}:{" "}
                        {queuePosition.data.ahead}
                      </p>
                    )}
                    {queuePosition.error && (
                      <p role="alert" className="text-sm text-destructive">
                        {queuePosition.error}
                      </p>
                    )}
                  </section>
                )}
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  {mode !== "reception" && (
                    <span className="text-sm">
                      {t("laboratory.balance")}:{" "}
                      {money(selected.invoice.balanceAmount)}{" "}
                      {selected.invoice.currency}
                    </span>
                  )}
                  {selected.lead && (
                    <Link
                      className="text-sm text-primary hover:underline"
                      to={`/crm/leads/${selected.lead.id}`}
                    >
                      {t("laboratory.lead")}: {selected.lead.name}
                    </Link>
                  )}
                  {selected.appointment && (
                    <span className="text-sm text-muted-foreground">
                      {t("laboratory.appointment")}:{" "}
                      {new Date(
                        selected.appointment.scheduledAt,
                      ).toLocaleString(i18n.language)}
                    </span>
                  )}
                </div>
                {selected.notes && (
                  <p className="whitespace-pre-wrap text-sm">
                    {selected.notes}
                  </p>
                )}
                {(mode === "completed" || mode === "received") &&
                  ["completed", "received", "called", "delivered"].includes(
                    selected.status,
                  ) && (
                    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                      <Label htmlFor="lab-attachment">
                        {t("laboratory.attachments")}
                      </Label>
                      {selected.status === "completed" && (
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          {t("laboratory.pdfReportRequired")}
                        </p>
                      )}
                      {canWork &&
                        mode === "completed" &&
                        selected.status === "completed" && (
                          <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/60 p-6 dark:border-emerald-600 dark:bg-emerald-950/20">
                            <FileUp
                              className="size-8 text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                            <Label
                              htmlFor="lab-attachment"
                              className="text-center text-sm font-semibold"
                            >
                              {t(
                                busy
                                  ? "laboratory.saving"
                                  : "laboratory.attachReport",
                              )}
                            </Label>
                            <p className="text-center text-xs text-muted-foreground">
                              {t("laboratory.attachmentHint")}
                            </p>
                            <Input
                              id="lab-attachment"
                              className="w-full max-w-md bg-background shadow-sm"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                              disabled={busy}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  setError(t("laboratory.attachmentHint"));
                                  return;
                                }
                                void run(() =>
                                  labApi.attach(selected.id, file),
                                );
                              }}
                            />
                          </div>
                        )}
                      {!selected.attachments?.length && (
                        <p className="text-sm text-muted-foreground">
                          {t("laboratory.noAttachments")}
                        </p>
                      )}
                      {selected.attachments?.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <Button
                            variant="outline"
                            disabled={busy}
                            className="h-auto max-w-full whitespace-normal break-all"
                            onClick={() => void openAttachment(file, true)}
                          >
                            {file.name} · {Math.ceil(file.size / 1024)} KB
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={busy}
                            onClick={() => void openAttachment(file, false)}
                          >
                            {t("laboratory.download")}
                          </Button>
                        </div>
                      ))}
                    </section>
                  )}
                {selected.status === "processing" &&
                canWork &&
                mode === "room" ? (
                  <section className="space-y-4">
                    <h2 className="font-semibold">{t("laboratory.results")}</h2>
                    {selected.items.map((item) => (
                      <Card key={item.id} className="space-y-4 rounded-2xl p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold">
                            {item.testName}
                          </h3>
                          <Badge variant="secondary">
                            {t("laboratory.specimen")}: {item.specimen}
                          </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`result-${item.id}`}>
                              {t("laboratory.result")}
                              {item.unit ? ` (${item.unit})` : ""}
                            </Label>
                            <Input
                              id={`result-${item.id}`}
                              value={results[item.id]?.result ?? ""}
                              maxLength={5000}
                              disabled={busy}
                              onChange={(event) =>
                                setResults((previous) => ({
                                  ...previous,
                                  [item.id]: {
                                    ...previous[item.id],
                                    result: event.target.value,
                                  },
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              {t("laboratory.referenceRange")}:{" "}
                              {item.referenceRange || "—"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`result-notes-${item.id}`}>
                              {t("laboratory.notes")}
                            </Label>
                            <Textarea
                              id={`result-notes-${item.id}`}
                              className="min-h-24 resize-y"
                              value={results[item.id]?.resultNotes ?? ""}
                              maxLength={5000}
                              disabled={busy}
                              onChange={(event) =>
                                setResults((previous) => ({
                                  ...previous,
                                  [item.id]: {
                                    ...previous[item.id],
                                    resultNotes: event.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </section>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {(mode === "reception"
                            ? ["test", "specimen"]
                            : ["test", "specimen", "result", "referenceRange"]
                          ).map((key) => (
                            <TableHead key={key}>
                              {t(`laboratory.${key}`)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody autoPaginate={false}>
                        {selected.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="min-w-40 font-medium">
                              {item.testName}
                            </TableCell>
                            <TableCell>{item.specimen}</TableCell>
                            {mode !== "reception" && (
                              <>
                                <TableCell className="min-w-56">
                                  {selected.status === "processing" &&
                                  canWork &&
                                  mode === "room" ? (
                                    <div className="space-y-2">
                                      <Input
                                        aria-label={`${t("laboratory.result")} ${item.testName}`}
                                        value={results[item.id]?.result ?? ""}
                                        maxLength={5000}
                                        onChange={(e) =>
                                          setResults((previous) => ({
                                            ...previous,
                                            [item.id]: {
                                              ...previous[item.id],
                                              result: e.target.value,
                                            },
                                          }))
                                        }
                                        disabled={busy}
                                      />
                                      <Textarea
                                        aria-label={`${t("laboratory.notes")} ${item.testName}`}
                                        placeholder={t("laboratory.notes")}
                                        value={
                                          results[item.id]?.resultNotes ?? ""
                                        }
                                        maxLength={5000}
                                        onChange={(e) =>
                                          setResults((previous) => ({
                                            ...previous,
                                            [item.id]: {
                                              ...previous[item.id],
                                              resultNotes: e.target.value,
                                            },
                                          }))
                                        }
                                        disabled={busy}
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="whitespace-pre-wrap">
                                        {item.result || "—"} {item.unit}
                                      </p>
                                      {item.resultNotes && (
                                        <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                                          {item.resultNotes}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.referenceRange || "—"}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {mode !== "reception" &&
                  hasPermission(user, "laboratory.payments.view") && (
                    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                      <h3 className="font-semibold">
                        {t("laboratory.paymentHistory")}
                      </h3>
                      <p className="text-sm">
                        {t("laboratory.paidAmount")}:{" "}
                        {money(selected.invoice.paidAmount)}{" "}
                        {selected.invoice.currency}
                      </p>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {[
                                "paymentDate",
                                "paymentAmount",
                                "paymentMethod",
                              ].map((key) => (
                                <TableHead key={key}>
                                  {t(`laboratory.${key}`)}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody autoPaginate={false}>
                            {!selected.invoice.payments?.length && (
                              <TableRow>
                                <TableCell colSpan={3}>
                                  {t("laboratory.noPayments")}
                                </TableCell>
                              </TableRow>
                            )}
                            {selected.invoice.payments?.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  {new Date(payment.paidAt).toLocaleString(
                                    i18n.language,
                                  )}
                                </TableCell>
                                <TableCell>
                                  {money(payment.amount)}{" "}
                                  {selected.invoice.currency}
                                </TableCell>
                                <TableCell>
                                  {t(`laboratory.${payment.method}`, {
                                    defaultValue: payment.method,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </section>
                  )}
                {mode === "accounting" &&
                  canPay &&
                  selected.invoice.balanceAmount > 0 &&
                  !["draft", "cancelled"].includes(selected.invoice.status) && (
                    <form
                      className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setConfirmPayment(true);
                      }}
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="lab-payment-amount">
                          {t("laboratory.paymentAmount")}
                        </Label>
                        <Input
                          id="lab-payment-amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          max={selected.invoice.balanceAmount}
                          required
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            paymentId.current = randomId();
                          }}
                          disabled={busy}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>{t("laboratory.paymentMethod")}</Label>
                        <Select
                          value={method}
                          onValueChange={(next) => {
                            setMethod(next);
                            paymentId.current = randomId();
                          }}
                          disabled={busy}
                        >
                          <SelectTrigger
                            aria-label={t("laboratory.paymentMethod")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {config.data?.paymentMethods.map((option) => (
                              <SelectItem key={option} value={option}>
                                {t(`laboratory.${option}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        permission="laboratory.payments.create"
                        type="submit"
                        className="self-end"
                        disabled={
                          busy || config.isLoading || Boolean(config.error)
                        }
                      >
                        {t("laboratory.recordPayment")}
                      </Button>
                      {config.error && (
                        <p
                          role="alert"
                          className="text-sm text-destructive sm:col-span-3"
                        >
                          {config.error}
                        </p>
                      )}
                    </form>
                  )}
                {mode === "reception" && canPrint && (
                  <div className="flex justify-end">
                    <Button
                      permission="laboratory.orders.print"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void print("ticket")}
                    >
                      {t("laboratory.printTicket")}
                    </Button>
                  </div>
                )}
                {mode !== "reception" && (
                  <div className="flex flex-wrap justify-end gap-3 rounded-2xl border bg-card p-4">
                    {canPrint && (
                      <Button
                        permission="laboratory.orders.print"
                        variant="outline"
                        onClick={() => print("invoice")}
                      >
                        {t("laboratory.printInvoice")}
                      </Button>
                    )}
                    {mode !== "accounting" &&
                      selected.status === "awaiting_payment" &&
                      hasPermission(user, "laboratory.payments.view") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate("/laboratory/accounting");
                          }}
                        >
                          {t("laboratory.accounting")}
                        </Button>
                      )}
                    {mode === "room" &&
                      canWork &&
                      ["waiting", "collecting"].includes(selected.status) &&
                      selected.invoice.status === "paid" && (
                        <Button
                          variant="outline"
                          disabled={busy}
                          permission="laboratory.orders.update"
                          onClick={() =>
                            void run(() => labApi.requestPatient(selected.id))
                          }
                        >
                          {t("laboratory.requestPatient")}
                        </Button>
                      )}
                    {(mode === "room" || mode === "completed") &&
                      canWork &&
                      [
                        "waiting",
                        "collecting",
                        "processing",
                        "completed",
                      ].includes(selected.status) && (
                        <>
                          {selected.status === "processing" && (
                            <Button
                              permission="laboratory.orders.update"
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                void run(() =>
                                  labApi.results(
                                    selected.id,
                                    selected.items.map((item) => ({
                                      id: item.id,
                                      ...results[item.id],
                                    })),
                                  ),
                                )
                              }
                            >
                              {t("laboratory.saveResults")}
                            </Button>
                          )}
                          <Button
                            permission="laboratory.orders.update"
                            disabled={
                              busy ||
                              (selected.status === "completed" &&
                                !selected.attachments?.some(
                                  (file) =>
                                    file.mime === "application/pdf" ||
                                    file.mime.startsWith("image/"),
                                ))
                            }
                            onClick={() =>
                              void run(async () => {
                                if (selected.status === "processing")
                                  await labApi.results(
                                    selected.id,
                                    selected.items.map((item) => ({
                                      id: item.id,
                                      ...results[item.id],
                                    })),
                                  );
                                return labApi.stage(
                                  selected.id,
                                  (
                                    {
                                      waiting: "processing",
                                      collecting: "processing",
                                      processing: "completed",
                                      completed: "received",
                                    } as Record<string, string>
                                  )[selected.status],
                                );
                              })
                            }
                          >
                            {t(
                              selected.status === "waiting"
                                ? "laboratory.startProcessing"
                                : selected.status === "collecting"
                                  ? "laboratory.startProcessing"
                                  : selected.status === "completed"
                                    ? "laboratory.sendReceived"
                                    : "laboratory.complete",
                            )}
                          </Button>
                        </>
                      )}
                    {mode === "received" && (
                      <div className="grid w-full gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-2">
                        <a
                          className="font-medium text-primary underline"
                          href={`tel:${selected.patient.phone}`}
                        >
                          {t("laboratory.callPatient")}:{" "}
                          {selected.patient.phone}
                        </a>
                        {selected.contactedAt && (
                          <p className="text-sm">
                            {t("laboratory.contactedAt")}:{" "}
                            {new Date(selected.contactedAt).toLocaleString(
                              i18n.language,
                            )}
                          </p>
                        )}
                        {selected.deliveredAt && (
                          <p className="text-sm">
                            {t("laboratory.deliveredAt")}:{" "}
                            {new Date(selected.deliveredAt).toLocaleString(
                              i18n.language,
                            )}
                          </p>
                        )}
                        {canWork &&
                          ["received", "called"].includes(selected.status) && (
                            <Button
                              disabled={busy}
                              permission="laboratory.orders.update"
                              onClick={() =>
                                void run(() =>
                                  labApi.stage(
                                    selected.id,
                                    selected.status === "received"
                                      ? "called"
                                      : "delivered",
                                  ),
                                )
                              }
                            >
                              {t(
                                selected.status === "received"
                                  ? "laboratory.markCalled"
                                  : "laboratory.markDelivered",
                              )}
                            </Button>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={confirmPayment}
        onOpenChange={(open) => {
          if (!busy) setConfirmPayment(open);
        }}
      >
        <AlertDialogContent dir={i18n.dir()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("laboratory.confirmPayment")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("laboratory.confirmPaymentHint")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selected && (
            <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
              <p className="font-semibold">
                {selected.patient.firstName} {selected.patient.lastName}
              </p>
              <p>
                {t("laboratory.invoice")}: {selected.invoice.invoiceNumber} ·{" "}
                {t("laboratory.queueNumber")}: {selected.queueNumber}
              </p>
              <p>
                {t("laboratory.paymentAmount")}:{" "}
                <strong>
                  {money(Number(amount))} {selected.invoice.currency}
                </strong>
              </p>
              <p>
                {t("laboratory.paymentMethod")}: {t(`laboratory.${method}`)}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t("laboratory.cancelPayment")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || !selected}
              onClick={() => {
                if (!selected) return;
                setConfirmPayment(false);
                void run(() =>
                  labApi.pay(selected.id, {
                    requestId: paymentId.current,
                    method,
                    amount: Number(amount),
                  }),
                );
              }}
            >
              {t("laboratory.confirmPayment")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
