import { useServerTable } from "@/shared/hooks/useServerTable";
import { settingsSnapshot } from "@/features/settings/settings";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CalendarDays,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Trash2,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfDay,
  startOfWeek,
  subMonths,
} from "date-fns";
import { healthcareApi, type HealthcareRecord } from "../api/healthcare.api";
import { hrApi } from "@/features/hr/api/hr.api";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export type HealthcareResource = keyof typeof healthcareApi;
type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
};
const configs: Record<
  HealthcareResource,
  {
    title: string;
    description: string;
    fields: Field[];
    columns: [string, string][];
  }
> = {
  specializations: {
    title: "Doctor specializations",
    description: "Manage the specializations available when editing doctors.",
    fields: [{ name: "name", label: "Name", required: true }],
    columns: [["name", "Name"]],
  },
  departments: {
    title: "Departments",
    description:
      "Manage hospital and office departments, managers and assigned employees.",
    fields: [
      {
        name: "name",
        label: "Department name",
        required: true,
      },
      {
        name: "type",
        label: "Department type",
        type: "select",
        required: true,
        options: ["hospital", "office"],
      },
      {
        name: "description",
        label: "Description",
      },
      {
        name: "managerId",
        label: "Department team leader",
        type: "employee",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["active", "inactive"],
      },
    ],
    columns: [
      ["code", "Code"],
      ["name", "Department"],
      ["type", "Department type"],
      ["manager", "Department team leader"],
      ["employeeCount", "Employees"],
      ["staffCount", "Health staff"],
      ["status", "Status"],
    ],
  },
  staff: {
    title: "Doctors & health staff",
    description: "Create medical profiles from existing HR employees.",
    fields: [
      {
        name: "employeeId",
        label: "Employee",
        type: "employee",
        required: true,
      },
      {
        name: "departmentId",
        label: "Department",
        type: "department",
      },
      { name: "positionId", label: "Position", type: "position" },
      {
        name: "staffType",
        label: "Clinical role",
        required: true,
        type: "select",
        options: [
          "doctor",
          "nurse",
          "technician",
          "pharmacist",
          "therapist",
          "other",
        ],
      },
      {
        name: "specialization",
        label: "Specialization",
        type: "specialization",
      },
      {
        name: "licenseNumber",
        label: "License number",
      },
      {
        name: "biography",
        label: "Biography",
      },
      {
        name: "publicBookingEnabled",
        label: "Public booking",
        required: true,
        defaultValue: "false",
        type: "boolean",
        options: ["true", "false"],
      },
      {
        name: "status",
        label: "Status",
        required: true,
        defaultValue: "active",
        type: "select",
        options: ["active", "inactive"],
      },
    ],
    columns: [
      ["employee", "Health professional"],
      ["staffType", "Staff type"],
      ["specialization", "Specialization"],
      ["department", "Department"],
      ["publicBookingEnabled", "Public booking"],
      ["status", "Status"],
    ],
  },
  appointments: {
    title: "Appointments",
    description: "Manage website and internally created patient appointments.",
    fields: [
      {
        name: "patientName",
        label: "Patient name",
        required: true,
      },
      {
        name: "patientPhone",
        label: "Patient phone",
        required: true,
      },
      {
        name: "patientEmail",
        label: "Patient email",
        type: "email",
      },
      {
        name: "departmentId",
        label: "Department",
        type: "department",
        required: true,
      },

      {
        name: "doctorId",
        label: "Doctor",
        type: "doctor",
        required: true,
      },
      {
        name: "scheduledAt",
        label: "Appointment date & time",
        type: "datetime-local",
        required: true,
      },
      {
        name: "durationMinutes",
        label: "Duration minutes",
        type: "number",
        required: true,
      },

      {
        name: "reason",
        label: "Reason",
      },
      {
        name: "notes",
        label: "Notes",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      },
    ],
    columns: [
      ["patient", "Patient"],
      ["doctor", "Doctor"],
      ["department", "Department"],
      ["scheduledAt", "Date & time"],
      ["source", "Source"],
      ["status", "Status"],
    ],
  },
};

const personName = (record: HealthcareRecord | undefined | null) =>
  record ? `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim() : "—";
const nested = (record: HealthcareRecord, key: string) =>
  record[key] as HealthcareRecord | undefined | null;

function display(record: HealthcareRecord, key: string): string | number {
  if (key === "manager") return personName(nested(record, "manager"));
  if (key === "employee") return personName(nested(record, "employee"));
  if (key === "patient")
    return `${record.patientName} · ${record.patientPhone}`;
  if (key === "doctor")
    return personName(
      nested(
        nested(record, "doctor") ?? ({ id: "" } as HealthcareRecord),
        "employee",
      ),
    );
  if (key === "department")
    return String(nested(record, "department")?.name ?? "—");
  if (key === "employeeCount")
    return Number(nested(record, "_count")?.employees ?? 0);
  if (key === "staffCount")
    return Number(nested(record, "_count")?.healthStaff ?? 0);
  if (key === "publicBookingEnabled")
    return record[key] ? "Enabled" : "Disabled";
  const value = record[key];
  if (value == null || value === "") return "—";
  if (key === "scheduledAt")
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(String(value)));
  return String(value).replaceAll("_", " ");
}

const appointmentColors: Record<string, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  confirmed:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  no_show:
    "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
};
const appointmentDots: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-teal-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
  no_show: "bg-slate-500",
};

function AppointmentCalendar({
  appointments,
  onEdit,
  onCreate,
}: {
  appointments: HealthcareRecord[];
  onEdit: (appointment: HealthcareRecord) => void;
  onCreate: (day: Date) => void;
}) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const doctors = Array.from(
    new Map(
      appointments.map((appointment) => [
        String((appointment.doctor as HealthcareRecord | undefined)?.id ?? ""),
        personName(
          nested(
            nested(appointment, "doctor") ?? ({ id: "" } as HealthcareRecord),
            "employee",
          ),
        ),
      ]),
    ).entries(),
  ).filter(([id]) => id);
  const filteredAppointments = appointments.filter(
    (appointment) =>
      (statusFilter === "all" || appointment.status === statusFilter) &&
      (doctorFilter === "all" ||
        String((appointment.doctor as HealthcareRecord | undefined)?.id) ===
          doctorFilter),
  );
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });
  const forDay = (day: Date) =>
    filteredAppointments
      .filter((appointment) =>
        isSameDay(new Date(String(appointment.scheduledAt)), day),
      )
      .sort(
        (a, b) =>
          new Date(String(a.scheduledAt)).getTime() -
          new Date(String(b.scheduledAt)).getTime(),
      );
  const selectedAppointments = forDay(selectedDay);
  const monthAppointments = filteredAppointments.filter((appointment) =>
    isSameMonth(new Date(String(appointment.scheduledAt)), month),
  );
  const todayAppointments = filteredAppointments.filter((appointment) =>
    isSameDay(new Date(String(appointment.scheduledAt)), new Date()),
  ).length;
  return (
    <div className="grid min-h-[700px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 border-e">
        <div className="border-b bg-linear-to-r from-primary/10 via-teal-500/5 to-transparent p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <CalendarDays />
              </span>
              <div>
                <h2 className="text-xl font-bold">
                  {format(month, "MMMM yyyy")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Doctor appointment schedule
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-xl border bg-background/80 p-1 shadow-sm backdrop-blur">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  setMonth(startOfMonth(today));
                  setSelectedDay(today);
                }}
              >
                Today
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setMonth((current) => subMonths(current, 1))}
              >
                <ChevronLeft className="rtl:rotate-180" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setMonth((current) => addMonths(current, 1))}
              >
                <ChevronRight className="rtl:rotate-180" />
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              [
                "This month",
                monthAppointments.length,
                "bg-primary/10 text-primary",
              ],
              [
                "Today",
                todayAppointments,
                "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
              ],
              [
                "Confirmed",
                monthAppointments.filter((item) => item.status === "confirmed")
                  .length,
                "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
              ],
              [
                "Completed",
                monthAppointments.filter((item) => item.status === "completed")
                  .length,
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
              ],
            ].map(([label, value, color]) => (
              <div
                key={String(label)}
                className="rounded-lg border bg-background/70 px-3 py-2"
              >
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p
                  className={`mt-0.5 inline-flex rounded-md px-2 py-0.5 text-sm font-bold ${color}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/70 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="h-8 w-48 bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("pageText.allDoctors")}
                  </SelectItem>
                  {doctors.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-40 bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("pageText.allStatuses")}
                  </SelectItem>
                  {[
                    "pending",
                    "confirmed",
                    "completed",
                    "cancelled",
                    "no_show",
                  ].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                "pending",
                "confirmed",
                "completed",
                "cancelled",
                "no_show",
              ].map((status) => (
                <span
                  key={status}
                  className="flex items-center gap-1.5 text-[10px] capitalize text-muted-foreground"
                >
                  <span
                    className={`size-2 rounded-full ${appointmentDots[status]}`}
                  />
                  {status.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto bg-muted/10 p-4">
          <div className="min-w-[820px] overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="grid grid-cols-7 border-b bg-muted/40">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="border-e px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground last:border-e-0"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dayAppointments = forDay(day);
                const selected = isSameDay(day, selectedDay);
                const today = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
                      if (day >= startOfDay(new Date())) onCreate(day);
                    }}
                    className={`group/day relative min-h-28 border-b border-e p-2.5 text-start transition-all duration-200 hover:z-10 hover:bg-primary/[0.04] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_25%,transparent)] ${!isSameMonth(day, month) ? "bg-muted/25 text-muted-foreground/35" : day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/[0.12]" : "bg-card"} ${selected ? "z-10 bg-primary/[0.06] shadow-[inset_0_0_0_2px_var(--primary)]" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`grid size-7 place-items-center rounded-lg text-xs font-bold transition-colors ${today ? "rounded-full bg-primary text-primary-foreground shadow-sm" : selected ? "bg-primary/10 text-primary" : "text-foreground"}`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="grid min-w-5 place-items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          {dayAppointments.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`flex items-center gap-1.5 truncate rounded-lg border px-2 py-1.5 text-[9px] font-semibold shadow-sm transition-transform group-hover/day:translate-x-0.5 rtl:group-hover/day:-translate-x-0.5 ${appointmentColors[String(appointment.status)] ?? appointmentColors.pending}`}
                        >
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${appointmentDots[String(appointment.status)] ?? appointmentDots.pending}`}
                          />
                          <span className="shrink-0">
                            {format(
                              new Date(String(appointment.scheduledAt)),
                              "HH:mm",
                            )}
                          </span>
                          <span className="truncate">
                            {String(appointment.patientName)}
                          </span>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <p className="px-1 text-[9px] font-semibold text-primary">
                          +{dayAppointments.length - 3} more
                        </p>
                      )}
                      {!dayAppointments.length && isSameMonth(day, month) && (
                        <span
                          className={`mt-4 block text-center text-[9px] font-medium text-muted-foreground/50 transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover/day:opacity-100"}`}
                        >
                          Available
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <aside className="bg-muted/20 p-4">
        <div className="mb-4 rounded-2xl bg-linear-to-br from-slate-950 to-teal-900 p-4 text-white shadow-md">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <CalendarCheck />
            </span>
            <Badge className="bg-white/15 text-white hover:bg-white/15">
              {selectedAppointments.length} scheduled
            </Badge>
          </div>
          <p className="mt-4 text-xs text-teal-200">
            {t("pageText.dailyAgenda")}
          </p>
          <h3 className="mt-0.5 text-lg font-bold">
            {format(selectedDay, "EEEE, MMMM d")}
          </h3>
        </div>
        <ScrollArea className="h-[520px] pe-2">
          <div className="space-y-3 pe-2">
            {selectedAppointments.length ? (
              selectedAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => onEdit(appointment)}
                  className="relative w-full overflow-hidden rounded-xl border bg-card p-3 ps-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span
                    className={`absolute inset-y-0 inset-s-0 w-1 ${appointmentDots[String(appointment.status)] ?? appointmentDots.pending}`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-bold">
                      <Clock3 className="size-3.5 text-primary" />
                      {format(
                        new Date(String(appointment.scheduledAt)),
                        "h:mm a",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className={`capitalize ${appointmentColors[String(appointment.status)] ?? ""}`}
                    >
                      {String(appointment.status).replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-2 font-semibold">
                    {String(appointment.patientName)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {String(appointment.patientPhone)}
                  </p>
                  <div className="mt-3 grid gap-1 border-t pt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="size-3" />
                      {personName(
                        nested(
                          nested(appointment, "doctor") ??
                            ({ id: "" } as HealthcareRecord),
                          "employee",
                        ),
                      )}
                    </span>
                    <span>
                      {String(
                        nested(appointment, "department")?.name ??
                          "Department not assigned",
                      )}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs">
                    {String(appointment.reason ?? "General appointment")}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <CalendarDays className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium">
                  {t("pageText.noAppointments")}
                </p>
                <p className="text-xs text-muted-foreground">
                  This day is available.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

export default function HealthcarePage({
  resource,
}: {
  resource: HealthcareResource;
}) {
  const { t } = useTranslation();
  const tr = (text: string) => {
    const key = text
      .toLowerCase()
      .replace(/[^a-z0-9]+(.)/g, (_match, character: string) =>
        character.toUpperCase(),
      );
    return t(`healthcareAdmin.${key}`, { defaultValue: text });
  };
  const [search, setSearch] = useState("");
  const config = configs[resource];
  const table = useServerTable<HealthcareRecord>(
    resource === "appointments"
      ? "/crm/appointments"
      : `/healthcare/${resource}`,
    { search },
  );
  const data = table;
  const calendar = useApiResource(
    useCallback(
      () =>
        resource === "appointments"
          ? healthcareApi.appointments.list()
          : Promise.resolve([]),
      [resource],
    ),
  );
  const employees = useApiResource(
    useCallback(() => hrApi.employees.list(), []),
  );
  const positions = useApiResource(
    useCallback(() => hrApi.positions.list(), []),
  );
  const departments = useApiResource(
    useCallback(() => healthcareApi.departments.list(), []),
  );
  const specializations = useApiResource(
    useCallback(() => healthcareApi.specializations.list(), []),
  );
  const staff = useApiResource(
    useCallback(() => healthcareApi.staff.list(), []),
  );
  const [editing, setEditing] = useState<HealthcareRecord | null | undefined>();
  const [appointmentView, setAppointmentView] = useState<"calendar" | "list">(
    "calendar",
  );
  const [appointmentDraftAt, setAppointmentDraftAt] = useState("");
  const [quickAppointment, setQuickAppointment] = useState<
    Record<string, string>
  >({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rows = data.data ?? [];
  const departmentSelectionScope = `${resource}|${search}|${data.pagination.page}`;
  const [departmentSelection, setDepartmentSelection] = useState({
    scope: departmentSelectionScope,
    ids: [] as string[],
  });
  const selectedDepartmentIds =
    departmentSelection.scope === departmentSelectionScope
      ? departmentSelection.ids
      : [];
  const allVisibleDepartmentsSelected =
    rows.length > 0 &&
    rows.every((row) => selectedDepartmentIds.includes(row.id));
  const toggleVisibleDepartments = (checked: boolean) => {
    const visibleIds = new Set(rows.map((row) => row.id));
    setDepartmentSelection((current) => {
      const selected =
        current.scope === departmentSelectionScope ? current.ids : [];
      return {
        scope: departmentSelectionScope,
        ids: checked
          ? [...new Set([...selected, ...visibleIds])]
          : selected.filter((id) => !visibleIds.has(id)),
      };
    });
  };
  useEffect(() => {
    if (resource !== "appointments" || !searchParams.get("patientName")) return;
    setQuickAppointment({
      patientName: searchParams.get("patientName") ?? "",
      patientPhone: searchParams.get("patientPhone") ?? "",
      patientEmail: searchParams.get("patientEmail") ?? "",
      reason: searchParams.get("reason") ?? "",
    });
    setEditing(null);
    setSearchParams({}, { replace: true });
  }, [resource, searchParams, setSearchParams]);
  const options = (field: Field) =>
    field.type === "position"
      ? (positions.data ?? [])
          .filter(
            (position) =>
              position.status === "active" ||
              position.id ===
                (editing?.employee as HealthcareRecord | undefined)?.positionId,
          )
          .map((position) => [position.id, String(position.name)])
      : field.type === "specialization"
        ? (specializations.data ?? []).map((item) => [
            String(item.name),
            String(item.name),
          ])
        : field.type === "employee"
          ? employees.data?.map((employee) => [
              employee.id,
              `${employee.employeeCode} — ${employee.firstName} ${employee.lastName}`,
            ])
          : field.type === "department"
            ? departments.data
                ?.filter(
                  (department) =>
                    department.type === "hospital" ||
                    department.id === editing?.departmentId,
                )
                .map((department) => [department.id, String(department.name)])
            : field.type === "doctor"
              ? staff.data
                  ?.filter((member) => member.staffType === "doctor")
                  .map((doctor) => [
                    doctor.id,
                    personName(nested(doctor, "employee")),
                  ])
              : field.options?.map((value) => [
                  value,
                  value.replaceAll("_", " "),
                ]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const rawValue = String(form.get(field.name) ?? "");
      const raw = rawValue === "__none__" ? "" : rawValue;
      if (
        resource === "staff" &&
        field.name === "positionId" &&
        (positions.isLoading || positions.error || (!editing && !raw))
      )
        continue;
      if (!raw && !field.required) {
        payload[field.name] = null;
        continue;
      }
      payload[field.name] =
        field.type === "number"
          ? Number(raw)
          : field.type === "boolean"
            ? raw === "true"
            : raw;
    }
    try {
      if (editing) await healthcareApi[resource].update(editing.id, payload);
      else await healthcareApi[resource].create(payload);
      setEditing(undefined);
      setQuickAppointment({});
      await Promise.all([
        data.refresh(),
        calendar.refresh(),
        departments.refresh(),
        staff.refresh(),
        specializations.refresh(),
        employees.refresh(),
      ]);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const removeSelectedDepartments = async () => {
    if (!selectedDepartmentIds.length) return;
    setBusy(true);
    try {
      await healthcareApi.departments.removeMany(selectedDepartmentIds);
      setDepartmentSelection({ scope: departmentSelectionScope, ids: [] });
      await data.refresh();
      toast.success(tr("departmentsDeleted"));
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{tr(config.title)}</h1>
        <p className="text-sm text-muted-foreground">
          {t(`healthcareAdmin.descriptions.${resource}`, {
            defaultValue: config.description,
          })}
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("healthcareAdmin.search", {
                  entity: tr(config.title),
                })}
              />
            </div>
            <div className="flex items-center gap-2">
              {resource === "departments" && selectedDepartmentIds.length > 0 && (
                <DeleteConfirmationDialog
                  description={tr("deleteSelectedDepartmentsConfirm")}
                  onConfirm={removeSelectedDepartments}
                >
                  <Button variant="destructive" disabled={busy}>
                    <Trash2 className="size-4" />
                    {t("healthcareAdmin.deleteSelectedDepartments", {
                      count: selectedDepartmentIds.length,
                    })}
                  </Button>
                </DeleteConfirmationDialog>
              )}
              {resource === "appointments" && (
                <div className="flex rounded-lg border p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      appointmentView === "calendar" ? "default" : "ghost"
                    }
                    onClick={() => setAppointmentView("calendar")}
                  >
                    <CalendarDays /> Calendar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={appointmentView === "list" ? "default" : "ghost"}
                    onClick={() => setAppointmentView("list")}
                  >
                    <List /> List
                  </Button>
                </div>
              )}
              <Button
                permission="create"
                onClick={() => {
                  setError("");
                  setAppointmentDraftAt("");
                  setEditing(null);
                }}
              >
                <Plus className="size-4" />
                {t("healthcareAdmin.addRecord")}
              </Button>
            </div>
          </div>
          {resource === "appointments" && appointmentView === "calendar" ? (
            <AppointmentCalendar
              appointments={(calendar.data ?? []).filter((row) =>
                JSON.stringify(row)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              onCreate={(day) => {
                setError("");
                setAppointmentDraftAt(`${format(day, "yyyy-MM-dd")}T09:00`);
                setEditing(null);
              }}
              onEdit={(appointment) => {
                setError("");
                setAppointmentDraftAt("");
                setEditing(appointment);
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {resource === "departments" && (
                      <TableHead className="w-12">
                        <Checkbox
                          aria-label={tr("selectVisibleDepartments")}
                          checked={
                            allVisibleDepartmentsSelected
                              ? true
                              : selectedDepartmentIds.length > 0
                                ? "indeterminate"
                                : false
                          }
                          disabled={busy || !rows.length}
                          onCheckedChange={(checked) =>
                            toggleVisibleDepartments(checked !== false)
                          }
                        />
                      </TableHead>
                    )}
                    {config.columns.map(([, label]) => (
                      <TableHead key={label}>{tr(label)}</TableHead>
                    ))}
                    <TableHead>{t("healthcareAdmin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody {...table.tableProps}>
                  <TableResourceState
                    isLoading={data.isLoading}
                    error={data.error}
                    isEmpty={!rows.length}
                    colSpan={
                      config.columns.length +
                      1 +
                      (resource === "departments" ? 1 : 0)
                    }
                  />
                  {!data.isLoading &&
                    !data.error &&
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        {resource === "departments" && (
                          <TableCell>
                            <Checkbox
                              aria-label={`${tr("selectDepartment")} ${String(row.name ?? "")}`}
                              checked={selectedDepartmentIds.includes(row.id)}
                              disabled={busy}
                              onCheckedChange={(checked) => {
                                const select = checked === true;
                                setDepartmentSelection((current) => {
                                  const selected =
                                    current.scope === departmentSelectionScope
                                      ? current.ids
                                      : [];
                                  return {
                                    scope: departmentSelectionScope,
                                    ids: select
                                      ? [...new Set([...selected, row.id])]
                                      : selected.filter((id) => id !== row.id),
                                  };
                                });
                              }}
                            />
                          </TableCell>
                        )}
                        {config.columns.map(([key]) => (
                          <TableCell key={key}>
                            {key === "type" ||
                            key === "status" ||
                            key === "publicBookingEnabled" ? (
                              <Badge variant="secondary">
                                {tr(String(display(row, key)))}
                              </Badge>
                            ) : (
                              display(row, key)
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-2">
                            {resource === "appointments" && (
                              <Button
                                permission="laboratory.orders.create"
                                variant="outline"
                                onClick={() =>
                                  navigate(
                                    `/laboratory/reception?appointmentId=${row.id}`,
                                  )
                                }
                              >
                                {t("laboratory.title")}
                              </Button>
                            )}
                            <Button
                              data-action="edit"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setError("");
                                setEditing(row);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <DeleteConfirmationDialog
                              description={t("healthcareAdmin.deleteConfirm")}
                              onConfirm={async () => {
                                try {
                                  await healthcareApi[resource].remove(row.id);
                                  await data.refresh();
                                } catch (cause) {
                                  toast.error(apiErrorMessage(cause));
                                }
                              }}
                            >
                              <Button
                                data-action="delete"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </DeleteConfirmationDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setEditing(undefined);
            setQuickAppointment({});
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("healthcareAdmin.editRecord")
                : t("healthcareAdmin.addRecord")}{" "}
              · {tr(config.title)}
            </DialogTitle>
          </DialogHeader>
          {resource === "staff" && positions.error && (
            <p role="alert" className="text-destructive">
              {positions.error}
            </p>
          )}
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
            {config.fields.map((field) => {
              const choices = options(field);
              const initial =
                field.name === "positionId"
                  ? (editing?.employee as HealthcareRecord | undefined)
                      ?.positionId
                  : editing?.[field.name];
              const initialValue =
                field.type === "datetime-local" && initial
                  ? new Date(String(initial)).toISOString().slice(0, 16)
                  : field.name === "scheduledAt" && appointmentDraftAt
                    ? appointmentDraftAt
                    : String(
                        initial ??
                          quickAppointment[field.name] ??
                          field.defaultValue ??
                          (field.name === "durationMinutes"
                            ? (settingsSnapshot()?.healthcare
                                .appointmentMinutes ?? 30)
                            : ""),
                      );
              return (
                <label
                  key={`${editing?.id ?? appointmentDraftAt ?? "new"}-${field.name}`}
                  className="space-y-1 text-xs font-medium"
                >
                  <span>{tr(field.label)}</span>
                  {choices ? (
                    <Select
                      name={field.name}
                      disabled={
                        field.type === "position" &&
                        (positions.isLoading || !!positions.error)
                      }
                      defaultValue={
                        initialValue ||
                        (field.required ? undefined : "__none__")
                      }
                      required={field.required}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("healthcareAdmin.selectField", {
                            field: tr(field.label),
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent className="z-10000">
                        {!field.required && (
                          <SelectItem value="__none__">
                            {t("healthcareAdmin.none")}
                          </SelectItem>
                        )}
                        {choices.map(([value, label]) => (
                          <SelectItem key={String(value)} value={String(value)}>
                            {field.options ? tr(String(label)) : String(label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "date" ||
                    field.type === "datetime-local" ? (
                    <FormDatePicker
                      name={field.name}
                      initialValue={initialValue}
                      includeTime={field.type === "datetime-local"}
                      minDate={
                        resource === "appointments" &&
                        field.name === "scheduledAt"
                          ? startOfDay(new Date())
                          : undefined
                      }
                      required={field.required}
                    />
                  ) : (
                    <Input
                      name={field.name}
                      type={field.type ?? "text"}
                      min={field.type === "number" ? 0 : undefined}
                      step={field.type === "number" ? 1 : undefined}
                      defaultValue={initialValue}
                      required={field.required}
                    />
                  )}
                </label>
              );
            })}
            {error && (
              <p className="text-sm text-destructive sm:col-span-2">{error}</p>
            )}
            <Button
              permission={editing ? "update" : "create"}
              className="sm:col-span-2"
              disabled={busy}
            >
              {busy ? t("healthcareAdmin.saving") : t("healthcareAdmin.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
