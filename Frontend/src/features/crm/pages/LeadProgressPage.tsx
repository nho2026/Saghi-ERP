import { PaginationControls } from "@/shared/components/ui/pagination-controls";
import { useServerTable } from "@/shared/hooks/useServerTable";
import type { CrmRecord } from "../api/crm.api";
import { hasPagePermission } from "@/features/auth/access";
import { useState } from "react";
import {
  Stethoscope,
  PhoneCall,
  ClipboardCheck,
  CalendarDays,
  UserRoundCheck,
  Scissors,
  CalendarCheck,
  CircleX,
  Clock3,
  ExternalLink,
  Eye,
  LayoutGrid,
  List,
  ListFilter,
  MapPin,
  Phone,
  Search,
  UserRound,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { crmApi } from "../api/crm.api";
import { storedUser } from "@/features/auth/access";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const emptyFilters = {
  status: "",
  source: "",
  gender: "",
  fromDate: "",
  toDate: "",
  dateField: "createdAt",
  minAge: "",
  maxAge: "",
  city: "",
  country: "",
  contactMethod: "",
  leadSourceChannel: "",
  patientType: "",
  referralPersona: "",
};
const fieldOptions = {
  contactMethod: ["phone", "whatsapp", "social_media", "walk_in", "email"],
  leadSourceChannel: ["digital", "traditional"],
  patientType: ["medical", "non_cardiac", "surgical"],
  referralPersona: ["doctor", "our_patient", "people"],
};

const stages = [
  "new",
  "contacted",
  "qualified",
  "appointment_requested",
  "surgery_appointment",
  "converted",
  "direct_surgery_converted",
];
const fallbackLabels: Record<string, string> = {
  new: "Consulted",
  contacted: "Follow-up",
  qualified: "Ready",
  appointment_requested: "OPD Appointment",
  surgery_appointment: "Surgery Appointment",
  converted: "OPD Converted",
  direct_surgery_converted: "Direct Surgery Converted",
  lost: "Lost",
};
const statusStyles: Record<string, string> = {
  new: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  contacted:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  qualified:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  appointment_requested:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  converted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  direct_surgery_converted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  surgery_appointment:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  lost: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};
const progressColors: Record<string, string> = {
  new: "#1C9B49",
  contacted: "#0891b2",
  qualified: "#7c3aed",
  appointment_requested: "#d97706",
  converted: "#059669",
  direct_surgery_converted: "#047857",
  surgery_appointment: "#ea580c",
  lost: "#dc2626",
};
const progressIcons = {
  new: Stethoscope,
  contacted: PhoneCall,
  qualified: ClipboardCheck,
  appointment_requested: CalendarDays,
  converted: UserRoundCheck,
  direct_surgery_converted: Scissors,
  surgery_appointment: CalendarCheck,
};
const StatusBadge = ({ status, label }: { status: string; label: string }) => (
  <Badge
    variant="outline"
    className={`whitespace-nowrap capitalize ${statusStyles[status] ?? ""}`}
  >
    <span className="me-1.5 size-1.5 rounded-full bg-current" />
    {label}
  </Badge>
);
function Progress({
  status,
  translate,
  compact = false,
}: {
  status: string;
  compact?: boolean;
  translate: (status: string) => string;
}) {
  const current = stages.indexOf(status);
  if (status === "lost")
    return <StatusBadge status="lost" label={translate("lost")} />;
  return (
    <div
      className={`relative grid grid-cols-7 px-1 pb-1 pt-0.5 ${compact ? "min-w-[520px]" : "min-w-[650px]"}`}
    >
      {stages.map((stage, index) => {
        const Icon = progressIcons[stage as keyof typeof progressIcons];
        return (
          <div key={stage} className="relative z-10 flex flex-col items-center">
            {index < stages.length - 1 && (
              <span
                className="absolute inset-s-1/2 top-[15px] -z-10 h-0.5 w-full bg-slate-200 dark:bg-slate-800"
                style={
                  index < current
                    ? { backgroundColor: progressColors[stage] }
                    : undefined
                }
              />
            )}
            <span
              className={`grid size-8 place-items-center rounded-full border-2 transition-colors ${index <= current ? "text-white" : "text-muted-foreground border-teal-200 bg-slate-50 dark:border-teal-900 dark:bg-slate-950"}`}
              style={
                index <= current
                  ? {
                      borderColor: progressColors[stage],
                      backgroundColor: progressColors[stage],
                      boxShadow: `0 0 0 ${index === current ? 4 : 3}px color-mix(in srgb, ${progressColors[stage]} ${index === current ? 25 : 12}%, transparent)`,
                    }
                  : undefined
              }
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span
              className={`mt-2 max-w-20 text-center leading-snug ${compact ? "text-[9px]" : "text-[10px]"} ${index <= current ? "font-semibold" : "font-medium text-slate-400"}`}
              style={
                index <= current ? { color: progressColors[stage] } : undefined
              }
            >
              {translate(stage)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
export default function LeadProgressPage() {
  const { t } = useTranslation();
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
  );
  const statusLabel = (status: string) =>
    fallbackLabels[status] ??
    t(`crm.values.${status}`, { defaultValue: status.replaceAll("_", " ") });
  const [view, setView] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draft, setDraft] = useState(filters);
  const leads = useServerTable<CrmRecord, { counts: Record<string, number> }>(
    "/crm/leads",
    {
      summary: "true",
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value),
      ),
      search,
    },
  );
  const rows = leads.data ?? [];
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "dateField" && value,
  ).length;
  const totals = leads.pageData?.counts ?? {};
  const markAsLost = async (id: string) => {
    try {
      await crmApi.leads.update(id, { status: "lost" });
      await leads.refresh();
      toast.success("Lead marked as lost.");
    } catch {
      toast.error(t("crm.errors.markLost"));
    }
  };
  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {t("crm.progress.eyebrow")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{t("crm.progress.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("crm.progress.description")}
        </p>
      </header>
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {[...stages, "lost"].map((status) => {
          const Icon =
            status === "lost"
              ? CircleX
              : progressIcons[status as keyof typeof progressIcons];
          return (
            <Button
              key={status}
              variant="outline"
              aria-pressed={filters.status === status}
              onClick={() => {
                const next = filters.status === status ? "" : status;
                setFilters((current) => ({ ...current, status: next }));
                setDraft((current) => ({ ...current, status: next }));
              }}
              className={`h-auto min-h-16 justify-start gap-2 rounded-xl px-3 py-2 text-start shadow-none ${statusStyles[status]} ${filters.status === status ? "ring-2 ring-current ring-offset-2 ring-offset-background" : ""}`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-current/10">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-normal text-[10px] font-medium leading-snug">
                  {statusLabel(status)}
                </span>
                <span className="mt-1 block text-lg font-bold tabular-nums">
                  {totals[status] ?? 0}
                </span>
              </span>
            </Button>
          );
        })}
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute inset-s-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="ps-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("crm.progress.search")}
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover
            open={filterOpen}
            onOpenChange={(open) => {
              if (open) setDraft(filters);
              setFilterOpen(open);
            }}
          >
            <PopoverTrigger asChild>
              <Button variant="outline">
                <ListFilter />
                {t("crm.progress.filter")}
                {activeFilterCount > 0 && (
                  <Badge className="ms-1 rounded-full px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex max-h-[min(65vh,32rem)] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden p-3"
            >
              <div className="mb-3 shrink-0">
                <p className="font-semibold">{t("crm.progress.filterTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("crm.progress.filterDescription")}
                </p>
              </div>
              <div className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto pe-1 [&_input]:h-8 [&_input]:text-xs [&_button]:h-8 [&_button]:text-xs [&_label]:text-[11px]">
                <div className="col-span-2 grid gap-1">
                  <Label htmlFor="lead-progress-date-field">
                    {t("crm.progress.dateField")}
                  </Label>
                  <Select
                    value={draft.dateField}
                    onValueChange={(value) =>
                      setDraft((current) => ({ ...current, dateField: value }))
                    }
                  >
                    <SelectTrigger id="lead-progress-date-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">
                        {t("crm.progress.createdDate")}
                      </SelectItem>
                      <SelectItem value="updatedAt">
                        {t("crm.progress.lastUpdate")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(["fromDate", "toDate"] as const).map((field) => (
                  <div
                    key={field}
                    className="grid gap-1.5"
                    role="group"
                    aria-label={t(`crm.referrals.${field}`)}
                  >
                    <Label>{t(`crm.referrals.${field}`)}</Label>
                    <FormDatePicker
                      value={draft[field]}
                      onValueChange={(value) =>
                        setDraft((current) => ({ ...current, [field]: value }))
                      }
                    />
                  </div>
                ))}
                {(["minAge", "maxAge", "city", "country"] as const).map(
                  (field) => (
                    <div key={field} className="grid gap-1.5">
                      <Label htmlFor={`lead-progress-${field}`}>
                        {t(
                          field === "minAge" || field === "maxAge"
                            ? `crm.progress.${field}`
                            : `crm.fields.${field}`,
                        )}
                      </Label>
                      <Input
                        id={`lead-progress-${field}`}
                        type={
                          field === "minAge" || field === "maxAge"
                            ? "number"
                            : "text"
                        }
                        min={0}
                        max={150}
                        maxLength={100}
                        value={draft[field]}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ),
                )}
                {(
                  Object.keys(fieldOptions) as (keyof typeof fieldOptions)[]
                ).map((field) => (
                  <div key={field} className="grid gap-1.5">
                    <Label htmlFor={`lead-progress-${field}`}>
                      {t(`crm.fields.${field}`)}
                    </Label>
                    <Select
                      value={draft[field] || "all"}
                      onValueChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          [field]: value === "all" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger id={`lead-progress-${field}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("crm.progress.allValues")}
                        </SelectItem>
                        {fieldOptions[field].map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`crm.values.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <label className="grid gap-1.5 text-xs font-medium">
                  {t("crm.fields.status")}
                  <Select
                    value={draft.status || "all"}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        status: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("crm.progress.allStatuses")}
                      </SelectItem>
                      {[...stages, "lost"].map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="grid gap-1.5 text-xs font-medium">
                  {t("crm.fields.source")}
                  <Input
                    value={draft.source}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        source: event.target.value,
                      }))
                    }
                    placeholder={t("crm.placeholders.sourceExamples")}
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium">
                  {t("crm.fields.gender")}
                  <Select
                    value={draft.gender || "all"}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        gender: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("crm.progress.allGenders")}
                      </SelectItem>
                      <SelectItem value="male">
                        {t("crm.values.male")}
                      </SelectItem>
                      <SelectItem value="female">
                        {t("crm.values.female")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("crm.values.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="mt-3 flex shrink-0 justify-end gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    const empty = { ...emptyFilters };
                    setDraft(empty);
                    setFilters(empty);
                    setFilterOpen(false);
                  }}
                >
                  {t("crm.actions.clear")}
                </Button>
                <Button
                  onClick={() => {
                    if (
                      draft.fromDate &&
                      draft.toDate &&
                      draft.fromDate > draft.toDate
                    ) {
                      toast.error(t("crm.progress.dateRangeError"));
                      return;
                    }
                    if (
                      (draft.minAge &&
                        (!Number.isInteger(Number(draft.minAge)) ||
                          Number(draft.minAge) < 0 ||
                          Number(draft.minAge) > 150)) ||
                      (draft.maxAge &&
                        (!Number.isInteger(Number(draft.maxAge)) ||
                          Number(draft.maxAge) < 0 ||
                          Number(draft.maxAge) > 150))
                    ) {
                      toast.error(t("crm.progress.ageValueError"));
                      return;
                    }
                    if (
                      draft.minAge &&
                      draft.maxAge &&
                      Number(draft.minAge) > Number(draft.maxAge)
                    ) {
                      toast.error(t("crm.errors.ageRange"));
                      return;
                    }
                    setFilters(draft);
                    setFilterOpen(false);
                  }}
                >
                  {t("crm.actions.applyFilters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex rounded-lg border p-1">
            <Button
              size="sm"
              variant={view === "table" ? "default" : "ghost"}
              onClick={() => setView("table")}
            >
              <List />
              {t("crm.actions.table")}
            </Button>
            <Button
              size="sm"
              variant={view === "grid" ? "default" : "ghost"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid />
              {t("crm.actions.grid")}
            </Button>
          </div>
        </div>
      </div>
      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("crm.progress.lead")}</TableHead>
                <TableHead>{t("crm.progress.contact")}</TableHead>
                <TableHead>{t("crm.fields.status")}</TableHead>
                <TableHead>{t("crm.progress.lastUpdate")}</TableHead>
                <TableHead>{t("crm.progress.currentProgress")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {rows.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <p className="font-semibold">{String(lead.name)}</p>
                    <p className="text-xs text-muted-foreground">
                      {String(lead.code ?? "—")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>{String(lead.phone)}</p>
                    <p className="text-xs text-muted-foreground">
                      {String(lead.address ?? "—")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={String(lead.status)}
                      label={statusLabel(String(lead.status))}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(String(lead.updatedAt)).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Progress
                      status={String(lead.status)}
                      translate={statusLabel}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label="Lead actions"
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {canManage && lead.status !== "lost" && (
                          <DropdownMenuItem
                            permission="update"
                            className="text-destructive focus:text-destructive"
                            onSelect={() => void markAsLost(lead.id)}
                          >
                            <CircleX /> Mark as Lost
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/crm/leads/${lead.id}#timeline`}>
                            <Clock3 /> Timeline
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/crm/leads/${lead.id}`}>
                            <ExternalLink /> Lead Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((lead) => (
            <Card key={lead.id} className="overflow-hidden">
              <div className="h-1.5 bg-linear-to-r from-primary to-teal-400" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <UserRound />
                  </span>
                  <StatusBadge
                    status={String(lead.status)}
                    label={statusLabel(String(lead.status))}
                  />
                </div>
                <h2 className="mt-4 text-lg font-bold">{String(lead.name)}</h2>
                <p className="text-xs text-muted-foreground">
                  {String(lead.code ?? "—")}
                </p>
                <div className="mt-4 grid gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    {String(lead.phone)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    {String(lead.address ?? "Not recorded")}
                  </span>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <Progress
                    status={String(lead.status)}
                    compact
                    translate={statusLabel}
                  />
                </div>
                <Button asChild className="mt-5 w-full" variant="outline">
                  <Link to={`/crm/leads/${lead.id}`}>
                    <Eye />
                    {t("crm.progress.view")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PaginationControls {...leads.pagination} />
    </div>
  );
}
