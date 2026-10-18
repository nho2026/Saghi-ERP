import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import DrugDoseCalculator, { type DrugProduct } from "./DrugDoseCalculator";
import { randomId } from "@/shared/lib/random-id";
import prescriptionPrintStyles from "./prescription-print.css?inline";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Plus, Printer, Trash2 } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useSettings } from "@/features/settings/settings";
import defaultLogo from "@/assets/icons/logo.png";
import arabicFont from "@/assets/fonts/arabic.ttf";
import kurdishFont from "@/assets/fonts/kurdish.ttf";
import { escapeReportHtml as esc } from "@/features/inventory/components/logic/patient-report";
type Line = {
  product?: DrugProduct;
  medicine: string;
  dosage: string;
  frequency: string;
  unitPrice: number;
  lineTotal?: number;
  currency?: string;
  unit?: string;
  quantity: number;
  instructions: string;
};
type Prescription = {
  id: string;
  patientName: string;
  patientCode: string;
  prescriberName: string;
  createdAt: string;
  items: Line[];
  notes: string;
};
const newLine = (medicine = ""): Line => ({
  medicine,
  dosage: "",
  frequency: "",
  unitPrice: 0,
  quantity: 1,
  instructions: "",
});
export default function PrescriptionWorkspace({
  patientId,
  patientWeightKg,
  canManage,
}: {
  patientId: string;
  patientWeightKg?: number | null;
  canManage: boolean;
}) {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`prescription.${key}`);
  const money = (value: number) =>
    value.toLocaleString(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const lineAmount = (line: Line) =>
    Math.round(line.quantity * line.unitPrice * 100) / 100;
  const invoiceTotal = (items: Line[]) =>
    items.every(
      (item) => item.lineTotal != null && Number.isFinite(item.lineTotal),
    )
      ? items.reduce((sum, item) => sum + item.lineTotal!, 0)
      : null;
  const settings = useSettings();
  const organization = settings?.organization;
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState(""),
    [lines, setLines] = useState<Line[]>([]),
    [notes, setNotes] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const request = useRef<string | null>(null),
    lock = useRef(false);
  const history = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<Prescription[]>(`/crm/prescriptions/patient/${patientId}`)
          .then((r) => r.data),
      [patientId],
    ),
  );
  const catalog = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<DrugProduct[]>("/crm/prescriptions/catalog")
          .then((r) => r.data),
      [],
    ),
  );
  const change = (index: number, patch: Partial<Line>) => {
    request.current = null;
    setLines((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };
  function print(record: Prescription) {
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    win.opener = null;
    const absolute = (url: string) => new URL(url, window.location.href).href;
    const font = i18n.language.startsWith("ar")
      ? "RxArabic"
      : i18n.language.startsWith("ku")
        ? "RxKurdish"
        : "Arial";
    const field = (label: string, value: string) =>
      `<div class="field"><span class="label">${esc(label)}</span><strong class="value">${esc(value)}</strong></div>`;
    win.document
      .write(`<!doctype html><html dir="${i18n.dir()}" lang="${esc(i18n.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(invoiceTotal(record.items) == null ? tr("title") : tr("invoice"))} — ${esc(record.patientName)}</title><style>@font-face{font-family:RxArabic;src:url("${absolute(arabicFont)}")}@font-face{font-family:RxKurdish;src:url("${absolute(kurdishFont)}")}body{font-family:${font},sans-serif}${prescriptionPrintStyles}</style></head><body>
      <div class="toolbar"><button onclick="window.print()">${esc(tr("print"))}</button></div>
      <main class="sheet"><header><img class="logo" src="${esc(absolute(organization?.logo || defaultLogo))}" alt="${esc(organization?.name || "")}"><div><h1>${esc(organization?.name || "")}</h1><div class="contact">${esc([organization?.address, organization?.phone, organization?.email].filter(Boolean).join(" · "))}</div></div></header>
      <div class="document-heading"><h2>${esc(invoiceTotal(record.items) == null ? tr("title") : tr("invoice"))}</h2><span class="rx" aria-hidden="true">℞</span></div>
      <section class="meta">${field(tr("patient"), record.patientName)}${field(tr("patientCode"), record.patientCode)}${field(tr("prescriber"), record.prescriberName)}${field(tr("issued"), new Date(record.createdAt).toLocaleString(i18n.language, { dateStyle: "medium", timeStyle: "short" }))}</section>
      ${record.items.map((line, index) => `<section class="medicine"><div class="medicine-heading"><span class="number">${index + 1}</span><h3>${esc(line.medicine)}</h3></div><div class="directions">${(["dosage", "frequency", "quantity"] as const).map((key) => `<div><span class="label">${esc(tr(key))}</span><strong class="value">${esc(line[key])}</strong></div>`).join("")}</div>${line.lineTotal != null ? `<div class="directions">${field(tr("unitPrice"), `${money(line.unitPrice)} ${line.currency ?? ""}`)}${field(tr("lineTotal"), `${money(line.lineTotal)} ${line.currency ?? ""}`)}</div>` : ""}${line.instructions ? `<p class="instructions"><span class="label">${esc(tr("instructions"))}</span>${esc(line.instructions)}</p>` : ""}</section>`).join("")}
      ${invoiceTotal(record.items) != null ? `<section class="notes"><strong>${esc(tr("total"))}: ${esc(money(invoiceTotal(record.items)!))} ${esc(record.items[0]?.currency ?? "")}</strong></section>` : ""}
      ${record.notes ? `<section class="notes"><strong>${esc(tr("notes"))}</strong><p>${esc(record.notes)}</p></section>` : ""}
      <footer><div class="reference">${esc(tr("reference"))}<br><span dir="ltr">${esc(record.id)}</span></div><div class="signature"><div class="signature-line"></div><span class="label">${esc(tr("signature"))}</span><strong>${esc(record.prescriberName)}</strong></div></footer></main></body></html>`);
    win.document.close();
    void Promise.all([
      win.document.fonts.load(`14px ${font}`).catch(() => undefined),
      ...Array.from(win.document.images).map((img) =>
        img.decode().catch(() => undefined),
      ),
    ]).then(() => {
      if (!win.closed) {
        win.focus();
        win.print();
      }
    });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current || !canManage || !lines.length) return;
    lock.current = true;
    setBusy(true);
    setError("");
    request.current ??= randomId();
    try {
      await apiClient.post(`/crm/prescriptions/patient/${patientId}`, {
        requestId: request.current,
        items: lines.map(({ product, ...line }) => ({
          ...line,
          ...(product && { productId: product.id }),
        })),
        notes,
      });
      setLines([]);
      setEditing(false);
      setNotes("");
      request.current = null;
      await history.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Card
      id="patient-medications"
      className="scroll-mt-6 space-y-5 p-5"
      dir={i18n.dir()}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{tr("medications")}</h2>
        {canManage && !editing && (
          <Button
            permission="crm.prescriptions.create"
            onClick={() => {
              setEditing(true);
              setLines([newLine()]);
              request.current = null;
              setError("");
            }}
          >
            <Plus className="size-4" />
            {tr("addMedication")}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {canManage && editing && (
        <div className="grid min-w-0 items-start gap-5">
          <div className="space-y-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr("search")}
              aria-label={tr("search")}
            />
            <p className="text-xs text-muted-foreground">{tr("catalogHint")}</p>
            {catalog.error && (
              <p role="alert" className="text-destructive">
                {catalog.error}
              </p>
            )}
            <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalog.data
                ?.filter((p) =>
                  `${p.name} ${p.sku}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .slice(0, 50)
                .map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto justify-start whitespace-normal p-3 text-start"
                    disabled={busy || lines.length >= 50}
                    onClick={() => {
                      request.current = null;
                      setLines((rows) => [
                        ...rows,
                        {
                          ...newLine(
                            `${product.name}${product.size ? ` (${product.size})` : ""}`,
                          ),
                          product,
                          unitPrice: product.sellingPrice,
                        },
                      ]);
                    }}
                  >
                    <Plus className="size-4 shrink-0" />
                    <span>
                      {product.name}
                      <small className="block text-muted-foreground">
                        {product.sku} · {product.size}
                      </small>
                    </span>
                  </Button>
                ))}
            </div>
          </div>
          <form onSubmit={save} className="min-w-0">
            <fieldset disabled={busy} className="space-y-4">
              <Button
                type="button"
                variant="outline"
                disabled={lines.length >= 50}
                onClick={() => {
                  request.current = null;
                  setLines((rows) => [...rows, newLine()]);
                }}
              >
                <Plus />
                {tr("add")}
              </Button>
              <Table
                className="w-full min-w-[900px] table-fixed"
                aria-label={tr("medications")}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">#</TableHead>
                    {(
                      [
                        "medicine",
                        "dosage",
                        "frequency",
                        "quantity",
                        "unitPrice",
                        "lineTotal",
                        "instructions",
                      ] as const
                    ).map((key) => (
                      <TableHead
                        key={key}
                        className={
                          key === "medicine"
                            ? "w-[23%] text-start"
                            : key === "quantity"
                              ? "w-20 text-start"
                              : "text-start"
                        }
                      >
                        {tr(key)}
                      </TableHead>
                    ))}
                    <TableHead className="w-14 text-center">
                      <span className="sr-only">{t("drugDose.title")}</span>
                      <Calculator
                        aria-hidden="true"
                        className="mx-auto size-4"
                      />
                    </TableHead>
                    <TableHead className="w-14">
                      <span className="sr-only">{tr("remove")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {lines.map((line, index) => (
                    <TableRow
                      key={index}
                      className="align-middle [&>td]:px-2 [&>td]:py-3"
                    >
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      {(
                        [
                          "medicine",
                          "dosage",
                          "frequency",
                          "quantity",
                          "unitPrice",
                        ] as const
                      ).map((key) => (
                        <TableCell key={key}>
                          <Input
                            className="h-9 min-w-0"
                            placeholder={tr(key)}
                            id={`rx-${index}-${key}`}
                            aria-label={`${tr(key)} ${index + 1}`}
                            required
                            readOnly={
                              (key === "medicine" || key === "unitPrice") &&
                              !!line.product
                            }
                            type={
                              key === "quantity" || key === "unitPrice"
                                ? "number"
                                : "text"
                            }
                            min={
                              key === "quantity"
                                ? 1
                                : key === "unitPrice"
                                  ? 0
                                  : undefined
                            }
                            max={
                              key === "quantity"
                                ? 100000
                                : key === "unitPrice"
                                  ? 100000000
                                  : undefined
                            }
                            step={
                              key === "quantity"
                                ? 1
                                : key === "unitPrice"
                                  ? "any"
                                  : undefined
                            }
                            maxLength={200}
                            value={line[key]}
                            onChange={(event) =>
                              change(index, {
                                [key]:
                                  key === "quantity" || key === "unitPrice"
                                    ? Number(event.target.value)
                                    : event.target.value,
                              })
                            }
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-end tabular-nums">
                        {money(lineAmount(line))}
                      </TableCell>
                      <TableCell>
                        <Textarea
                          rows={1}
                          className="h-9 min-h-9 resize-none overflow-y-auto py-2"
                          placeholder={tr("instructions")}
                          id={`rx-instructions-${index}`}
                          aria-label={`${tr("instructions")} ${index + 1}`}
                          maxLength={1000}
                          value={line.instructions}
                          onChange={(event) =>
                            change(index, { instructions: event.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {line.product ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9 border-primary/20 bg-primary/10 text-primary"
                                aria-label={t("drugDose.title")}
                                title={t("drugDose.title")}
                              >
                                <Calculator className="size-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-80 max-w-[90vw]"
                              dir={i18n.dir()}
                            >
                              <p className="mb-2 font-semibold">
                                {line.medicine}
                              </p>
                              <DrugDoseCalculator
                                product={line.product}
                                patientWeightKg={patientWeightKg}
                                onApply={(dosage, frequency) =>
                                  change(index, { dosage, frequency })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          permission="view"
                          data-action="delete"
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${tr("remove")} ${index + 1}`}
                          onClick={() => {
                            request.current = null;
                            setLines((rows) =>
                              rows.filter((_, i) => i !== index),
                            );
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-end font-semibold" aria-live="polite">
                {tr("total")}:{" "}
                {money(lines.reduce((sum, line) => sum + lineAmount(line), 0))}{" "}
                {settings?.finance.currency}
              </p>
              <p className="text-xs text-muted-foreground">
                {tr("billingHint")}
              </p>
              <Label htmlFor="rx-notes">{tr("notes")}</Label>
              <Textarea
                id="rx-notes"
                maxLength={4000}
                value={notes}
                onChange={(e) => {
                  request.current = null;
                  setNotes(e.target.value);
                }}
              />
              <Button
                permission="crm.prescriptions.create"
                type="submit"
                disabled={busy || !lines.length}
              >
                {busy ? tr("saving") : tr("save")}
              </Button>
            </fieldset>
          </form>
        </div>
      )}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-semibold">{tr("history")}</h3>
        {history.error && (
          <p role="alert" className="text-destructive">
            {history.error}
          </p>
        )}
        {history.isLoading ? (
          <p>{t("resourceState.loading")}</p>
        ) : !history.error && !history.data?.length ? (
          <p className="text-muted-foreground">{tr("empty")}</p>
        ) : (
          history.data?.map((record) => (
            <Card
              key={record.id}
              className="flex flex-row items-center justify-between gap-4 p-4"
            >
              <div>
                <strong>{record.prescriberName}</strong>
                <p className="text-sm text-muted-foreground">
                  {new Date(record.createdAt).toLocaleString(i18n.language)}
                </p>
                {invoiceTotal(record.items) != null && (
                  <p className="font-semibold">
                    {tr("total")}: {money(invoiceTotal(record.items)!)}{" "}
                    {record.items[0]?.currency}
                  </p>
                )}
                <div className="mt-3 space-y-3">
                  {record.items.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-medium">{item.medicine}</p>
                      <p className="text-sm">
                        {tr("dosage")}: {item.dosage} · {tr("frequency")}:{" "}
                        {item.frequency} · {tr("quantity")}: {item.quantity}
                        {item.lineTotal != null && (
                          <>
                            {" "}
                            · {tr("lineTotal")}: {money(item.lineTotal)}{" "}
                            {item.currency}
                          </>
                        )}
                      </p>
                      {item.instructions && (
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {item.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {record.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm">
                    {tr("notes")}: {record.notes}
                  </p>
                )}
              </div>
              <Button
                permission="crm.prescriptions.print"
                variant="outline"
                onClick={() => print(record)}
              >
                <Printer className="size-4" />
                {tr("print")}
              </Button>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
