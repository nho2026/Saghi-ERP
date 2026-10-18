import { randomId } from "@/shared/lib/random-id";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, Plus, Printer, Trash2, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { inventoryApi, productImageUrl } from "../api/inventory.api";
type Line = {
  originalIndex?: number;
  id: string;
  isNew: boolean;
  productId: string;
  name: string;
  size: string;
  code: string;
  quantity: string;
  price: string;
  note: string;
  imageUrl: string;
};
const newLine = (): Line => ({
  id: randomId(),
  isNew: false,
  productId: "",
  name: "",
  size: "",
  code: "",
  quantity: "1",
  price: "0",
  note: "",
  imageUrl: "",
});
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export type EditableOrder = {
  id: string;
  name: string;
  note: string;
  items: {
    isNew: boolean;
    productId: string | null;
    name: string;
    size: string;
    code: string;
    quantity: number;
    price: number;
    note: string;
    imageUrl?: string | null;
    arrived?: boolean;
    arrivedAt?: string | null;
  }[];
};
export function OrderForm({
  order,
  onSaved,
  onBusy,
}: {
  order?: EditableOrder;
  onSaved: () => void;
  onBusy: (value: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const products = useApiResource(
    useCallback(
      () =>
        inventoryApi
          .all("products")
          .then((items) => items.filter((item) => item.status === "active")),
      [],
    ),
  );
  const [name, setName] = useState(order?.name ?? "");
  const [note, setNote] = useState(order?.note ?? "");
  const [lines, setLines] = useState<Line[]>(
    () =>
      order?.items.map((item, originalIndex) => ({
        ...item,
        id: randomId(),
        originalIndex,
        productId: item.productId ?? "",
        imageUrl: item.imageUrl ?? "",
        quantity: String(item.quantity),
        price: String(item.price),
      })) ?? [],
  );
  const [draft, setDraft] = useState<Line | null>(null);
  const [draftError, setDraftError] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const requestId = useRef(randomId());
  const canSubmit = hasPermission(
    storedUser(),
    order ? "inventory.orders.update" : "inventory.orders.create",
  );
  const money = (v: number) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  const lineTotal = (line: Line) =>
    Math.round(Number(line.quantity) * Math.round(Number(line.price) * 100)) /
    100;
  const total =
    lines.reduce((sum, line) => sum + Math.round(lineTotal(line) * 100), 0) /
    100;
  const change = (id: string, patch: Partial<Line>) =>
    setDraft((item) => (item?.id === id ? { ...item, ...patch } : item));
  const saveItem = () => {
    if (!draft || busy) return;
    if (
      (draft.isNew ? !draft.name.trim() : !draft.productId) ||
      !draft.quantity ||
      Number(draft.quantity) <= 0 ||
      Number(draft.quantity) > 1000000 ||
      !Number.isFinite(Number(draft.quantity)) ||
      !draft.price ||
      Number(draft.price) < 0 ||
      Number(draft.price) > 100000000 ||
      !Number.isFinite(Number(draft.price)) ||
      Math.abs(
        Number(draft.price) * 100 - Math.round(Number(draft.price) * 100),
      ) > 0.000001
    ) {
      setDraftError(t("orderForm.invalid"));
      return;
    }
    setLines((items) =>
      items.some((item) => item.id === draft.id)
        ? items.map((item) => (item.id === draft.id ? draft : item))
        : [...items, draft],
    );
    setDraft(null);
    setDraftError("");
  };
  const print = () => {
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    win.opener = null;
    win.document.write(
      `<!doctype html><html dir="${i18n.dir()}"><head><meta charset="utf-8"><title>${esc(name || t("warehouseModule.order"))}</title><style>body{font:13px Arial;padding:24px}h1{color:#159b83}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:start}th{background:#eff9f5}p{white-space:pre-wrap}@page{size:A4 landscape;margin:12mm}</style></head><body><h1>${esc(t("warehouseModule.order"))}: ${esc(name)}</h1><p>${esc(note)}</p><table><thead><tr>${["product", "size", "code", "quantity", "price", "totalPrice", "note"].map((key) => `<th>${esc(t(`orderForm.${key}`))}</th>`).join("")}</tr></thead><tbody>${lines.map((line) => `<tr><td>${esc(line.name)}</td><td>${esc(line.size)}</td><td>${esc(line.code)}</td><td>${esc(line.quantity)}</td><td>${esc(money(Number(line.price)))}</td><td>${esc(money(lineTotal(line)))}</td><td>${esc(line.note)}</td></tr>`).join("")}</tbody></table><h3>${esc(t("orderForm.totalPrice"))}: ${esc(money(total))}</h3></body></html>`,
    );
    win.document.close();
    win.focus();
    win.print();
  };
  const uploadImage = async (id: string, file: File) => {
    if (lock.current || saved || !canSubmit) return;
    if (
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError(t("buyProductForm.fileError"));
      return;
    }
    lock.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      const uploaded = await inventoryApi.uploadImages([file]);
      if (!uploaded[0]?.imageUrl) throw new Error("Image upload failed");
      change(id, { imageUrl: uploaded[0].imageUrl });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current || saved || !canSubmit) return;
    setError("");
    if (
      !name.trim() ||
      !lines.length ||
      lines.some(
        (line) =>
          (line.isNew ? !line.name.trim() : !line.productId) ||
          !Number.isFinite(Number(line.quantity)) ||
          Number(line.quantity) <= 0 ||
          !line.price ||
          !Number.isFinite(Number(line.price)) ||
          Number(line.price) < 0,
      )
    ) {
      setError(t("orderForm.invalid"));
      return;
    }
    lock.current = true;
    setBusy(true);
    onBusy(true);
    try {
      await apiClient.request({
        method: order ? "PATCH" : "POST",
        url: order ? `/inventory/orders/${order.id}` : "/inventory/orders",
        data: {
          originalItems: order?.items,
          requestId: requestId.current,
          name,
          note,
          items: lines.map((line) => ({
            originalIndex: line.originalIndex,
            isNew: line.isNew,
            productId: line.isNew ? null : line.productId,
            name: line.name,
            size: line.size,
            code: line.code,
            quantity: Number(line.quantity),
            price: Number(line.price),
            note: line.note,
            imageUrl: line.imageUrl || null,
          })),
        },
      });
      setSaved(true);
      onSaved();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 px-6 pb-5">
          {(error || products.error) && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              <span>{error || products.error}</span>
            </div>
          )}
          {saved && (
            <p
              role="status"
              className="rounded-lg bg-teal-500/10 p-3 text-sm text-teal-700 dark:text-teal-300"
            >
              {t("orderForm.saved")}
            </p>
          )}
          <fieldset disabled={busy || saved} className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-full space-y-1.5 sm:w-72">
                <Label htmlFor="order-name">{t("orderForm.name")}</Label>
                <Input
                  id="order-name"
                  required
                  maxLength={150}
                  value={name}
                  placeholder={t("orderForm.name")}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-full space-y-1.5 sm:w-72">
                <Label htmlFor="order-note">{t("orderForm.orderNote")}</Label>
                <Input
                  id="order-note"
                  maxLength={5000}
                  value={note}
                  placeholder={t("orderForm.note")}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button
                type="button"
                className="bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                disabled={lines.length >= 100}
                aria-label={t("buyProductForm.addItem")}
                onClick={() => {
                  setDraft(newLine());
                  setDraftError("");
                  setError("");
                }}
              >
                <Plus className="size-4" />
                {t("buyProductForm.addItem")}
              </Button>
            </div>
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  {[
                    "new",
                    "product",
                    "size",
                    "code",
                    "quantity",
                    "price",
                    "totalPrice",
                    "image",
                    "note",
                    "actions",
                  ].map((key) => (
                    <TableHead
                      key={key}
                      className={`text-xs font-medium text-muted-foreground ${key === "new" ? "w-16 min-w-16 px-4 text-center" : ""}`}
                    >
                      {t(`orderForm.${key}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody autoPaginate={false}>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-28 text-center text-muted-foreground"
                    >
                      {t("orderForm.emptyItems")}
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        {t(line.isNew ? "orderHistory.yes" : "orderHistory.no")}
                      </TableCell>
                      <TableCell className="font-medium">{line.name}</TableCell>
                      <TableCell>{line.size || "—"}</TableCell>
                      <TableCell>{line.code || "—"}</TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>{money(Number(line.price))}</TableCell>
                      <TableCell>{money(lineTotal(line))}</TableCell>
                      <TableCell>
                        {line.imageUrl ? (
                          <img
                            src={productImageUrl(line.imageUrl)}
                            alt={line.name}
                            className="size-10 rounded object-contain"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-60 whitespace-pre-wrap">
                        {line.note || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            permission="view"
                            data-action="edit"
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`${t("orderForm.editItem")} ${line.name}`}
                            onClick={() => {
                              setDraft({ ...line });
                              setDraftError("");
                              setError("");
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            permission="view"
                            data-action="delete"
                            type="button"
                            variant="destructive"
                            size="icon"
                            aria-label={`${t("buyProductForm.remove")} ${line.name}`}
                            onClick={() =>
                              setLines((items) =>
                                items.filter((item) => item.id !== line.id),
                              )
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </fieldset>
        </div>
      </ScrollArea>
      <div className="shrink-0 space-y-3 border-t bg-background px-6 py-4">
        <p className="text-sm font-semibold">
          {t("orderForm.totalPrice")}: <output>{money(total)}</output>
        </p>
        <div className="flex gap-3">
          {saved ? (
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setName("");
                setNote("");
                setLines([]);
                setSaved(false);
                setError("");
                requestId.current = randomId();
              }}
            >
              {t("orderForm.another")}
            </Button>
          ) : (
            <Button
              permission={order ? "update" : "create"}
              type="submit"
              disabled={busy || !canSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t(
                busy
                  ? "buyHistory.processing"
                  : order
                    ? "common.save"
                    : "orderForm.submit",
              )}
            </Button>
          )}
          <Button
            permission="print"
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={print}
          >
            <Printer className="size-4" />
            {t("buyHistory.print")}
          </Button>
        </div>
        {!canSubmit && (
          <p className="text-sm text-muted-foreground">
            {t("orderForm.noPermission")}
          </p>
        )}
      </div>
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open && !busy) setDraft(null);
        }}
      >
        <DialogContent
          className="max-h-[85vh] overflow-y-auto sm:max-w-xl"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              event.target instanceof HTMLInputElement &&
              event.target.type !== "file"
            ) {
              event.preventDefault();
              saveItem();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t(
                draft && lines.some((line) => line.id === draft.id)
                  ? "orderForm.editItem"
                  : "buyProductForm.addItem",
              )}
            </DialogTitle>
          </DialogHeader>
          {(draftError || error) && (
            <p role="alert" className="text-sm text-destructive">
              {draftError || error}
            </p>
          )}
          {draft &&
            (() => {
              const line = draft;
              return (
                <fieldset
                  disabled={busy || saved}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Checkbox
                      id="order-item-new"
                      disabled={busy || saved}
                      checked={line.isNew}
                      aria-label={`${t("orderForm.new")} ${line.name || t("orderForm.product")}`}
                      onCheckedChange={(checked) =>
                        change(line.id, {
                          isNew: checked === true,
                          productId: "",
                          name: "",
                          code: "",
                          imageUrl: "",
                          price: "0",
                        })
                      }
                    />
                    <Label htmlFor="order-item-new" className="cursor-pointer">
                      {t("orderForm.new")}
                    </Label>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="order-item-product">
                      {t("orderForm.product")}
                    </Label>
                    {line.isNew ? (
                      <Input
                        id="order-item-product"
                        required
                        maxLength={200}
                        aria-label={t("orderForm.product")}
                        placeholder={t("orderForm.newName")}
                        value={line.name}
                        onChange={(e) =>
                          change(line.id, { name: e.target.value })
                        }
                      />
                    ) : (
                      <Select
                        required
                        disabled={busy || saved || products.isLoading}
                        value={line.productId}
                        onValueChange={(id) => {
                          const p = products.data?.find(
                            (item) => item.id === id,
                          );
                          if (p)
                            change(line.id, {
                              productId: id,
                              name: p.name,
                              code: p.sku || "",
                              price: String(p.costPrice ?? 0),
                              imageUrl:
                                p.images?.find(
                                  (img: { isMain: boolean }) => img.isMain,
                                )?.imageUrl ??
                                p.images?.[0]?.imageUrl ??
                                "",
                            });
                        }}
                      >
                        <SelectTrigger
                          id="order-item-product"
                          className="w-full"
                          aria-label={t("orderForm.product")}
                        >
                          <SelectValue
                            placeholder={t(
                              products.isLoading
                                ? "resourceState.loading"
                                : "buyProductForm.selectProduct",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {products.data?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="order-item-size">
                      {t("orderForm.size")}
                    </Label>
                    <Input
                      className="min-w-24"
                      id="order-item-size"
                      aria-label={t("orderForm.size")}
                      placeholder={t("orderForm.size")}
                      maxLength={100}
                      value={line.size}
                      onChange={(e) =>
                        change(line.id, { size: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="order-item-code">
                      {t("orderForm.code")}
                    </Label>
                    <Input
                      className="min-w-24"
                      id="order-item-code"
                      aria-label={t("orderForm.code")}
                      placeholder={t("orderForm.code")}
                      maxLength={100}
                      value={line.code}
                      onChange={(e) =>
                        change(line.id, { code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="order-item-quantity">
                      {t("orderForm.quantity")}
                    </Label>
                    <Input
                      className="min-w-24"
                      type="number"
                      required
                      min="0.001"
                      max="1000000"
                      step="0.001"
                      id="order-item-quantity"
                      aria-label={t("orderForm.quantity")}
                      value={line.quantity}
                      onChange={(e) =>
                        change(line.id, { quantity: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="order-item-price">
                      {t("orderForm.price")}
                    </Label>
                    <Input
                      className="min-w-24"
                      type="number"
                      required
                      min="0"
                      max="100000000"
                      step="0.01"
                      id="order-item-price"
                      aria-label={t("orderForm.price")}
                      value={line.price}
                      onChange={(e) =>
                        change(line.id, { price: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label>{t("orderForm.image")}</Label>
                    <Input
                      id={`order-image-${line.id}`}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={busy || saved || !canSubmit}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void uploadImage(line.id, file);
                      }}
                    />
                    <Button
                      permission="inventory.products.create"
                      type="button"
                      variant="outline"
                      className="h-14 w-full justify-start gap-3"
                      disabled={busy || saved || !canSubmit}
                      title={t("orderForm.chooseImage")}
                      aria-label={`${t("orderForm.chooseImage")} ${line.name || t("orderForm.product")}`}
                      onClick={() =>
                        document
                          .getElementById(`order-image-${line.id}`)
                          ?.click()
                      }
                    >
                      {line.imageUrl ? (
                        <img
                          src={productImageUrl(line.imageUrl)}
                          alt={line.name}
                          className="size-10 rounded object-contain"
                        />
                      ) : (
                        <span
                          className="grid size-12 place-items-center rounded bg-muted"
                          role="img"
                          aria-label={t("orderForm.noImage")}
                        >
                          <ImageIcon className="size-5 text-muted-foreground" />
                        </span>
                      )}
                      {t("orderForm.chooseImage")}
                    </Button>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="order-item-note">
                      {t("orderForm.note")}
                    </Label>
                    <Textarea
                      rows={2}
                      id="order-item-note"
                      aria-label={t("orderForm.note")}
                      placeholder={t("orderForm.note")}
                      maxLength={1000}
                      value={line.note}
                      onChange={(e) =>
                        change(line.id, { note: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-semibold sm:col-span-2">
                    <span>{t("orderForm.totalPrice")}</span>
                    <output>{money(lineTotal(line))}</output>
                  </div>
                </fieldset>
              );
            })()}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" disabled={busy} onClick={saveItem}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
