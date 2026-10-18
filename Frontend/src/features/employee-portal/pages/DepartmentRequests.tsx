import { toast } from "sonner";
import { randomId } from "@/shared/lib/random-id";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleSlash, PackagePlus, Plus, Send, Trash2 } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import {
  type PageData,
  type RecordItem,
} from "@/features/inventory/api/inventory.api";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { SearchableFilter } from "@/shared/components/ui/searchable-filter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table";
type Line = { id: string; stockId: string; quantity: string };
const newLine = (): Line => ({
  id: randomId(),
  stockId: "",
  quantity: "1",
});
export default function DepartmentRequests() {
  const { t, i18n } = useTranslation();
  const emptyCell = (
    <span className="inline-flex items-center text-muted-foreground">
      <CircleSlash className="size-4" aria-hidden="true" />
      <span className="sr-only">{t("healthcareAdmin.none")}</span>
    </span>
  );
  const [page, setPage] = useState(1);
  const orders = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<PageData>("/inventory/department-requests", {
            params: { page, pageSize: 10 },
          })
          .then((r) => r.data),
      [page],
    ),
  );
  const catalog = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<RecordItem[]>("/inventory/department-requests/catalog")
          .then((r) => r.data),
      [],
    ),
  );
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [type, setType] = useState("disposable");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const actionLock = useRef(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  async function requestAction(id: string, action: "cancel" | "remind") {
    if (actionLock.current) return;
    actionLock.current = true;
    setActionBusy(id);
    try {
      await apiClient.post(`/inventory/department-requests/${id}/${action}`);
      toast.success(
        t(
          action === "cancel"
            ? "departmentRequest.cancelSuccess"
            : "departmentRequest.reminderSuccess",
        ),
      );
      await orders.refresh();
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      actionLock.current = false;
      setActionBusy(null);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    if (
      !lines.length ||
      lines.some(
        (line) =>
          !line.stockId ||
          !Number.isFinite(Number(line.quantity)) ||
          Number(line.quantity) <= 0,
      )
    ) {
      setError(t("departmentRequest.invalid"));
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      await apiClient.post("/inventory/department-requests", {
        type,
        note,
        items: lines.map((line) => {
          const stock = catalog.data?.find((s) => s.id === line.stockId);
          return {
            productId: stock?.productId,
            warehouseId: stock?.warehouseId,
            quantity: Number(line.quantity),
          };
        }),
      });
      setOpen(false);
      setLines([newLine()]);
      setNote("");
      setPage(1);
      await orders.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Card className="overflow-hidden" dir={i18n.dir()}>
      <div className="flex items-center justify-between gap-3 p-4">
        <h2 className="font-semibold">{t("departmentRequest.title")}</h2>
        <Button
          permission="inventory.department-requests.create"
          disabled={catalog.isLoading || !!catalog.error}
          onClick={() => {
            setError("");
            setOpen(true);
            void catalog.refresh();
          }}
        >
          <Plus className="size-4" />
          {t("departmentRequest.new")}
        </Button>
      </div>
      {(orders.error || catalog.error) && (
        <p role="alert" className="px-4 pb-3 text-sm text-destructive">
          {orders.error || catalog.error}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {[
              "date",
              "totalProducts",
              "note",
              "status",
              "reason",
              "actions",
            ].map((k) => (
              <TableHead key={k}>{t(`departmentOrders.${k}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody autoPaginate={false}>
          {orders.isLoading || !orders.data?.items.length ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {t(
                  orders.isLoading
                    ? "resourceState.loading"
                    : "resourceState.notFound",
                )}
              </TableCell>
            </TableRow>
          ) : (
            orders.data.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {new Date(order.createdAt).toLocaleString(i18n.language)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.items.map(
                      (
                        item: {
                          name: string;
                          quantity: number;
                          warehouseName?: string;
                        },
                        index: number,
                      ) => (
                        <p key={index}>
                          {item.name} × {item.quantity} · {item.warehouseName}
                        </p>
                      ),
                    )}
                  </div>
                </TableCell>
                <TableCell>{order.note || emptyCell}</TableCell>
                <TableCell>{t(`departmentOrders.${order.status}`)}</TableCell>
                <TableCell>{order.reason || emptyCell}</TableCell>
                <TableCell>
                  {order.status === "pending" ? (
                    <div
                      className="flex flex-wrap gap-2"
                      aria-busy={actionBusy === order.id}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        permission="inventory.department-requests.create"
                        disabled={actionBusy !== null}
                        onClick={() => void requestAction(order.id, "remind")}
                      >
                        {t("departmentRequest.sendReminder")}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        permission="inventory.department-requests.create"
                        disabled={actionBusy !== null}
                        onClick={() => void requestAction(order.id, "cancel")}
                      >
                        {t("departmentRequest.cancelOrder")}
                      </Button>
                    </div>
                  ) : (
                    emptyCell
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-2 border-t p-3">
        <Button
          variant="outline"
          disabled={page <= 1 || orders.isLoading}
          onClick={() => setPage((p) => p - 1)}
        >
          {t("transferForm.previous")}
        </Button>
        <Button
          variant="outline"
          disabled={
            orders.isLoading ||
            page >= (orders.data?.pagination.totalPages ?? 1)
          }
          onClick={() => setPage((p) => p + 1)}
        >
          {t("transferForm.next")}
        </Button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!lock.current) setOpen(v);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="flex max-h-[90dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-card p-0 sm:max-w-2xl"
        >
          <DialogHeader className="shrink-0 border-b px-5 py-5 pe-14 text-start sm:px-6 sm:pe-14">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <PackagePlus className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <DialogTitle className="text-lg">
                  {t("departmentRequest.new")}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed">
                  {t("departmentRequest.help")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={submit} className="flex min-h-0 flex-col">
            <ScrollArea className="min-h-0 [&_[data-radix-scroll-area-viewport]]:h-auto [&_[data-radix-scroll-area-viewport]]:max-h-[calc(90dvh-210px)] [&_[data-radix-scroll-area-viewport]]:overscroll-contain">
              <div className="space-y-5 px-5 py-5 sm:px-6">
                {error && (
                  <p role="alert" className="text-destructive">
                    {error}
                  </p>
                )}
                <fieldset disabled={busy} className="min-w-0 space-y-5">
                  <div className="space-y-2">
                    <Label>{t("departmentOrders.type")}</Label>
                    <SearchableFilter
                      value={type}
                      onValueChange={setType}
                      label={t("departmentOrders.type")}
                      className="w-full"
                      options={["disposable", "equipment"].map((value) => ({
                        value,
                        label: t(`departmentOrders.${value}`),
                      }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("buyProductForm.items")}</Label>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                        {lines.length}
                      </span>
                    </div>
                    {lines.map((line, index) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[minmax(0,1fr)_36px] items-end gap-3 rounded-xl border border-border/70 bg-muted/25 p-3 sm:grid-cols-[24px_minmax(0,1fr)_96px_36px] sm:p-4"
                      >
                        <span className="hidden self-center text-xs font-semibold tabular-nums text-muted-foreground sm:block">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="col-span-2 min-w-0 space-y-2 sm:col-span-1">
                          <Label>{t("departmentRequest.productStorage")}</Label>
                          <SearchableFilter
                            className="w-full"
                            pageSize={30}
                            label={t("departmentRequest.productStorage")}
                            value={line.stockId}
                            onValueChange={(stockId) =>
                              setLines((items) =>
                                items.map((item) =>
                                  item.id === line.id
                                    ? { ...item, stockId }
                                    : item,
                                ),
                              )
                            }
                            options={(catalog.data ?? []).map((stock) => ({
                              value: stock.id,
                              label: `${stock.product.name} · ${stock.warehouse.name} (${stock.quantity})`,
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={line.id}>
                            {t("orderForm.quantity")}
                          </Label>
                          <Input
                            id={line.id}
                            type="number"
                            min="0.001"
                            max="1000000"
                            step="0.001"
                            required
                            value={line.quantity}
                            onChange={(e) =>
                              setLines((items) =>
                                items.map((item) =>
                                  item.id === line.id
                                    ? { ...item, quantity: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        </div>
                        <Button
                          permission="view"
                          data-action="delete"
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
                          aria-label={t("buyProductForm.remove")}
                          onClick={() =>
                            setLines((items) =>
                              items.filter((item) => item.id !== line.id),
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed bg-transparent text-primary shadow-none hover:bg-primary/5"
                      disabled={lines.length >= 100}
                      onClick={() => setLines((items) => [...items, newLine()])}
                    >
                      <Plus className="size-4" />
                      {t("buyProductForm.addItem")}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department-request-note">
                      {t("orderForm.note")}
                    </Label>
                    <Textarea
                      id="department-request-note"
                      className="min-h-20 resize-none bg-background"
                      rows={3}
                      maxLength={5000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </fieldset>
              </div>
            </ScrollArea>
            <DialogFooter className="shrink-0 border-t bg-muted/25 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                permission="inventory.department-requests.create"
                className="min-w-28"
                disabled={busy || catalog.isLoading || !lines.length}
              >
                <Send className="size-4" aria-hidden="true" />
                {t(busy ? "buyHistory.processing" : "orderForm.submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
