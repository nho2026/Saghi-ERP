import type { Page } from "@/shared/api/pagination";
import defaultLogo from "@/assets/icons/logo.png";
import arabicFont from "@/assets/fonts/arabic.ttf";
import kurdishFont from "@/assets/fonts/kurdish.ttf";
import printStyles from "../components/styles/patient-report-print.css?inline";
import { useSettings } from "@/features/settings/settings";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Printer, RefreshCw, ArrowUpDown } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";

import {
  csvCell,
  emptyReportFilters,
  escapeReportHtml as esc,
  reportTotals,
  type PatientProductRow,
  type ReportFilters,
} from "../components/logic/patient-report";
const columns = [
  "patientName",
  "patientCode",
  "department",
  "departmentType",
  "product",
  "size",
  "code",
  "barcode",
  "quantity",
  "cost",
  "price",
  "profit",
  "date",
] as const;
type Column = (typeof columns)[number];
const units = ["icu", "picu", "cardiac-sw", "cardiac-surgery", "cardiology"];
const download = (content: string, name: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function ReportChart({
  title,
  groups,
  series,
  format,
}: {
  title: string;
  groups: { name: string; values: number[] }[];
  series: { label: string; color: string }[];
  format: (value: number) => string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const { t, i18n } = useTranslation();
  const chartFont = i18n.language.startsWith("ar")
    ? '"NHO Arabic", Arial, sans-serif'
    : i18n.language.startsWith("ku")
      ? '"NHO Kurdish", Arial, sans-serif'
      : '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const values = groups.flatMap((group) => group.values);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const extent = maximum - minimum;
  const zero = (-minimum / extent) * 305;
  const rowHeight = series.length * 24 + 18;
  const height = Math.max(140, 82 + groups.length * rowHeight);
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold 2xl:text-xl">{title}</h2>
        <Button
          permission="export"
          variant="outline"
          size="sm"
          disabled={!groups.length}
          onClick={() => {
            if (ref.current)
              download(
                new XMLSerializer().serializeToString(ref.current),
                `${title}.svg`,
                "image/svg+xml;charset=utf-8",
              );
          }}
        >
          <Download className="size-4" />
          {t("patientReport.chartExport")}
        </Button>
      </div>
      {!groups.length ? (
        <p className="py-12 text-center text-muted-foreground">
          {t("patientReport.empty")}
        </p>
      ) : (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 640 ${height}`}
          role="img"
          aria-label={title}
          className="w-full rounded bg-white"
          style={{ direction: "ltr", fontFamily: chartFont }}
        >
          <title>{title}</title>
          <rect width="640" height={height} fill="white" />
          <text x="12" y="22" fontSize="15" fontWeight="600" fill="#0f172a">
            {title}
          </text>
          {series.map((s, i) => (
            <g key={s.label} transform={`translate(${12 + i * 205},44)`}>
              <rect width="10" height="10" fill={s.color} />
              <text x="16" y="10" fontSize="11" fill="#334155">
                {s.label}
              </text>
            </g>
          ))}
          {groups.map((group, index) => (
            <g
              key={group.name}
              transform={`translate(0,${70 + index * rowHeight})`}
            >
              <text x="12" y="14" fontSize="12" fill="#334155">
                <title>{group.name}</title>
                {group.name.length > 24
                  ? `${group.name.slice(0, 23)}…`
                  : group.name}
              </text>
              {group.values.map((value, seriesIndex) => (
                <g
                  key={seriesIndex}
                  transform={`translate(190,${seriesIndex * 24})`}
                >
                  <rect width="305" height="16" rx="3" fill="#f1f5f9" />
                  <rect
                    x={value < 0 ? zero + (value / extent) * 305 : zero}
                    width={(Math.abs(value) / extent) * 305}
                    height="16"
                    rx="3"
                    fill={value < 0 ? "#dc2626" : series[seriesIndex].color}
                  >
                    <title>{`${group.name}: ${series[seriesIndex].label} ${format(value)}`}</title>
                  </rect>
                  <line x1={zero} x2={zero} y1="0" y2="16" stroke="#94a3b8" />
                  <text
                    x="313"
                    y="13"
                    fontSize="11"
                    fill={value < 0 ? "#dc2626" : "#334155"}
                  >
                    {format(value)}
                  </text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      )}
    </Card>
  );
}
export default function PatientProductsReportPage() {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`patientReport.${key}`);
  const organization = useSettings()?.organization;
  const logo = organization?.logo || defaultLogo;
  const organizationName = organization?.name || "";
  const language = i18n.language.split("-")[0];
  const reportFont =
    language === "ar"
      ? '"NHO Arabic", sans-serif'
      : language === "ku"
        ? '"NHO Kurdish", sans-serif'
        : '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

  const [filters, setFilters] = useState<ReportFilters>(emptyReportFilters);
  const visible: Column[] = [...columns];
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: Column; descending: boolean }>({
    key: "date",
    descending: true,
  });
  type ReportPage = Page<PatientProductRow> & {
    totals: ReturnType<typeof reportTotals>;
    productGroups: { name: string; values: number[] }[];
    departmentGroups: { name: string; values: number[] }[];
  };
  const query = JSON.stringify({
    ...filters,
    sort: sort.key,
    descending: String(sort.descending),
    locale: i18n.language,
  });
  const resource = useApiResource(
    useCallback(
      () =>
        apiClient
          .get<ReportPage>("/inventory/reports/products-per-patient", {
            params: { ...JSON.parse(query), page, pageSize: 20 },
          })
          .then((response) => response.data),
      [query, page],
    ),
  );
  const loadExport = () =>
    apiClient
      .get<PatientProductRow[]>("/inventory/reports/products-per-patient", {
        params: JSON.parse(query),
      })
      .then((response) => response.data);
  const [printError, setPrintError] = useState("");
  const chartsRef = useRef<HTMLDivElement>(null);
  const update = (patch: Partial<ReportFilters>) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  };
  const invalid = !!(
    filters.start &&
    filters.end &&
    filters.start > filters.end
  );
  const sorted = resource.data?.items ?? [];
  const totals = resource.data?.totals ?? reportTotals([]);
  const totalPages = resource.data?.pagination.totalPages ?? 1;
  const currentPage = resource.data?.pagination.page ?? page;
  const totalRows = resource.data?.pagination.total ?? 0;
  const displayedColumns = columns.filter((column) => visible.includes(column));
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "USD",
    }).format(value);
  const number = (value: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 3 }).format(
      value,
    );
  const department = (unit: string) =>
    t(
      `warehouseModule.${({ "cardiac-sw": "cardiacSw", "cardiac-surgery": "cardiacSurgery" } as Record<string, string>)[unit] ?? unit}`,
      { defaultValue: unit },
    );
  const cellValue = (
    row: PatientProductRow,
    column: Column,
  ): string | number => {
    if (column === "department") return department(row.department);
    if (column === "departmentType")
      return row.departmentType
        ? t(`icu.${row.departmentType}`, { defaultValue: row.departmentType })
        : "";
    if (column === "date")
      return new Date(row.date).toLocaleDateString(i18n.language);
    return row[column];
  };
  const cellText = (row: PatientProductRow, column: Column) =>
    ["cost", "price", "profit"].includes(column)
      ? money(row[column] as number)
      : column === "quantity"
        ? number(row.quantity)
        : cellValue(row, column) || "—";
  const productGroups = resource.data?.productGroups ?? [];
  const departmentGroups = (resource.data?.departmentGroups ?? []).map(
    (group) => ({ ...group, name: department(group.name) }),
  );
  const unavailable = resource.isLoading || !!resource.error || invalid;
  const filterSummary = [
    filters.department === "all"
      ? tr("allDepartments")
      : department(filters.department),
    filters.product,
    filters.patient,
    filters.search,
    filters.start,
    filters.end,
  ]
    .filter(Boolean)
    .join(" · ");
  async function exportCsv() {
    let sorted: PatientProductRow[];
    try {
      sorted = await loadExport();
    } catch {
      setPrintError(
        t("resourceState.error", {
          defaultValue: "Unable to load the full report.",
        }),
      );
      return;
    }
    const data = [
      displayedColumns.map((column) => tr(column)),
      ...sorted.map((row) =>
        displayedColumns.map((column) => cellValue(row, column)),
      ),
      [],
      [
        tr("totals"),
        tr("quantity"),
        totals.quantity,
        tr("cost"),
        totals.cost,
        tr("price"),
        totals.price,
        tr("profit"),
        totals.profit,
      ],
      [tr("filters"), filterSummary],
    ];
    download(
      "\ufeff" + data.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      "products-used-for-patients.csv",
      "text/csv;charset=utf-8",
    );
  }
  async function print() {
    setPrintError("");
    const win = window.open("", "_blank", "width=1200,height=800");
    if (!win) {
      setPrintError(t("buyHistory.popupBlocked"));
      return;
    }
    win.opener = null;
    const charts = Array.from(chartsRef.current?.querySelectorAll("svg") ?? [])
      .map((svg) => `<figure>${svg.outerHTML}</figure>`)
      .join("");
    const absolute = (url: string) => new URL(url, window.location.href).href;
    const fontStyles = `@font-face{font-family:"NHO Arabic";src:url("${absolute(arabicFont)}") format("truetype");font-weight:100 900}@font-face{font-family:"NHO Kurdish";src:url("${absolute(kurdishFont)}") format("truetype");font-weight:100 900}body{font-family:${reportFont}}svg{font-family:inherit}`;
    const generatedAt = new Date().toLocaleString(i18n.language);
    const contact = [
      organization?.address,
      organization?.phone,
      organization?.email,
    ]
      .filter(Boolean)
      .join(" · ");
    const numeric = (column: Column) =>
      ["quantity", "cost", "price", "profit"].includes(column);
    let sorted: PatientProductRow[];
    try {
      sorted = await loadExport();
    } catch {
      win.close();
      setPrintError("Unable to load the full report.");
      return;
    }
    win.document
      .write(`<!doctype html><html lang="${esc(i18n.language)}" dir="${i18n.dir()}"><head><meta charset="utf-8"><title>${esc(tr("title"))}</title><style>${printStyles}${fontStyles}</style></head><body><main class="report">
      <button class="print-button" onclick="window.print()">${esc(tr("print"))}</button>
      <header class="report-header"><div class="brand"><img src="${esc(absolute(logo))}" alt="${esc(organizationName)}"><div><p class="brand-name">${esc(organizationName)}</p><div class="contact">${esc(contact)}</div></div></div><div class="metadata">${esc(tr("generated"))}<br><strong>${esc(generatedAt)}</strong></div></header>
      <section class="report-heading"><h1>${esc(tr("title"))}</h1><div class="source">${esc(tr("source"))}</div></section>
      <div class="filters"><strong>${esc(tr("filters"))}</strong> &nbsp; ${esc(filterSummary)}</div>
      <div class="totals">${(["quantity", "cost", "price", "profit"] as const).map((key) => `<div class="metric"><span>${esc(tr(key))}</span><strong class="${key === "profit" ? (totals.profit < 0 ? "negative" : "positive") : ""}">${esc(key === "quantity" ? number(totals[key]) : money(totals[key]))}</strong></div>`).join("")}</div>
      <div class="charts">${charts}</div>
      <table><thead><tr>${displayedColumns.map((column) => `<th class="${numeric(column) ? "numeric" : ""}">${esc(tr(column))}</th>`).join("")}</tr></thead><tbody>${sorted.map((row) => `<tr>${displayedColumns.map((column) => `<td class="${numeric(column) ? "numeric" : ""} ${column === "profit" ? (row.profit < 0 ? "negative" : "positive") : ""}">${esc(cellText(row, column))}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <footer><span>${esc(organizationName)}</span><span>${esc(tr("rows"))}: ${esc(number(totalRows))} · ${esc(tr("title"))}</span></footer>
      </main></body></html>`);
    win.document.close();
    const images = Array.from(win.document.images).map((image) =>
      image.decode().catch(() => undefined),
    );
    void Promise.all([
      win.document.fonts
        .load(`12px ${reportFont.split(",")[0]}`)
        .catch(() => undefined),
      win.document.fonts.ready,
      ...images,
    ]).then(() => {
      if (!win.closed) {
        win.focus();
        win.print();
      }
    });
  }

  return (
    <div
      className="space-y-6 antialiased 2xl:text-lg 2xl:[&_button]:text-base 2xl:[&_input]:text-base 2xl:[&_label]:text-base 2xl:[&_table]:text-base"
      dir={i18n.dir()}
      style={{ fontFamily: reportFont }}
    >
      <Card className="flex flex-row flex-wrap items-center justify-between gap-6 border-t-4 border-t-teal-600 p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <img
            src={logo}
            alt={organizationName}
            className="size-20 shrink-0 rounded-xl bg-white p-2 object-contain"
          />
          <div className="space-y-2">
            <p className="text-sm 2xl:text-base font-semibold text-teal-700 dark:text-teal-400">
              {organizationName}
            </p>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl 2xl:text-4xl">
              {tr("title")}
            </h1>
          </div>
        </div>
        <Badge
          variant="outline"
          className="px-3 py-1.5 text-xs 2xl:text-sm font-normal"
        >
          {new Date().toLocaleDateString(i18n.language, { dateStyle: "long" })}
        </Badge>
      </Card>
      <Card className="p-5 shadow-none">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44 space-y-1 2xl:w-52">
            <Label>{tr("department")}</Label>
            <Select
              value={filters.department}
              onValueChange={(value) => update({ department: value })}
            >
              <SelectTrigger className="w-full" aria-label={tr("department")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr("allDepartments")}</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {department(unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            className="w-48 2xl:w-56"
            placeholder={tr("searchProduct")}
            aria-label={tr("searchProduct")}
            value={filters.product}
            onChange={(event) => update({ product: event.target.value })}
          />
          <Input
            className="w-48 2xl:w-56"
            placeholder={tr("searchPatient")}
            aria-label={tr("searchPatient")}
            value={filters.patient}
            onChange={(event) => update({ patient: event.target.value })}
          />
          {(["start", "end"] as const).map((key) => (
            <div
              key={key}
              className="w-44 space-y-1 2xl:w-52"
              role="group"
              aria-label={tr(key)}
            >
              <Label>{tr(key)}</Label>
              <FormDatePicker
                value={filters[key]}
                onValueChange={(value) => update({ [key]: value })}
              />
            </div>
          ))}
          <div className="flex w-full flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFilters(emptyReportFilters);
                setPage(1);
              }}
            >
              {tr("clear")}
            </Button>
            <Button
              disabled={resource.isLoading}
              onClick={() => void resource.refresh()}
            >
              <RefreshCw className="size-4" />
              {tr("refresh")}
            </Button>
            <Button
              permission="export"
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={unavailable || !totalRows}
              onClick={exportCsv}
            >
              <Download className="size-4" />
              {tr("export")}
            </Button>
            <Button
              permission="print"
              variant="outline"
              disabled={unavailable || !totalRows}
              onClick={print}
            >
              <Printer className="size-4" />
              {tr("print")}
            </Button>
          </div>
        </div>
      </Card>
      <p className="max-w-5xl text-xs 2xl:text-sm leading-relaxed text-muted-foreground">
        {tr("source")}
      </p>
      {(resource.error || printError || invalid) && (
        <p role="alert" className="text-destructive">
          {invalid ? tr("invalidDates") : resource.error || printError}
        </p>
      )}
      {resource.isLoading ? (
        <p role="status" className="py-12 text-center">
          {t("resourceState.loading")}
        </p>
      ) : (
        !resource.error &&
        !invalid && (
          <>
            <div
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              aria-label={tr("totals")}
            >
              {(["quantity", "cost", "price", "profit"] as const).map((key) => (
                <Card
                  key={key}
                  className="gap-3 border-t-2 border-t-teal-600 p-5 shadow-none"
                >
                  <span className="text-xs 2xl:text-base font-medium text-muted-foreground">
                    {tr(key)}
                  </span>
                  <strong
                    className={`text-2xl 2xl:text-3xl font-semibold tracking-tight tabular-nums ${key === "profit" ? (totals.profit < 0 ? "text-destructive" : "text-emerald-600") : ""}`}
                  >
                    {key === "quantity"
                      ? number(totals[key])
                      : money(totals[key])}
                  </strong>
                </Card>
              ))}
            </div>
            <div
              ref={chartsRef}
              className="grid items-start gap-4 xl:grid-cols-2"
            >
              <ReportChart
                title={tr("topProducts")}
                groups={productGroups}
                series={[{ label: tr("quantity"), color: "#1C9B49" }]}
                format={number}
              />
              <ReportChart
                title={tr("departmentChart")}
                groups={departmentGroups}
                series={[
                  { label: tr("cost"), color: "#64748b" },
                  { label: tr("price"), color: "#1C9B49" },
                  { label: tr("profit"), color: "#8b5cf6" },
                ]}
                format={money}
              />
            </div>
            <Card className="gap-0 overflow-hidden py-0">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <Input
                  className="max-w-sm"
                  placeholder={tr("search")}
                  aria-label={tr("search")}
                  value={filters.search}
                  onChange={(event) => update({ search: event.target.value })}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {displayedColumns.map((column) => (
                      <TableHead
                        key={column}
                        aria-sort={
                          sort.key === column
                            ? sort.descending
                              ? "descending"
                              : "ascending"
                            : "none"
                        }
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 text-start whitespace-normal"
                          onClick={() => {
                            setSort({
                              key: column,
                              descending:
                                sort.key === column ? !sort.descending : false,
                            });
                            setPage(1);
                          }}
                        >
                          {tr(column)}
                          <ArrowUpDown className="size-3 shrink-0" />
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {sorted.length ? (
                    sorted.map((row) => (
                      <TableRow key={row.id}>
                        {displayedColumns.map((column) => (
                          <TableCell
                            key={column}
                            className={
                              column === "profit"
                                ? row.profit < 0
                                  ? "text-destructive"
                                  : "text-emerald-600"
                                : ""
                            }
                          >
                            {column === "department" ||
                            (column === "departmentType" &&
                              row.departmentType) ? (
                              <Badge variant="outline">
                                {cellText(row, column)}
                              </Badge>
                            ) : (
                              cellText(row, column)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={displayedColumns.length}
                        className="h-24 text-center"
                      >
                        {tr("empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between gap-3 p-4">
                <span className="text-sm 2xl:text-base text-muted-foreground">
                  {tr("rows")}: {number(totalRows)} · {currentPage} /{" "}
                  {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    {t("transferForm.previous")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    {t("transferForm.next")}
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )
      )}
    </div>
  );
}
