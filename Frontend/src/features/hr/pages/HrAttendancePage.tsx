import { useServerTable } from "@/shared/hooks/useServerTable";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";
import { hasPermission } from "@/features/auth/access";
import { DeleteConfirmationDialog } from "@/features/attendance/components/DeleteConfirmationDialog";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Link2,
  LogIn,
  LogOut,
  Search,
  TimerOff,
  UsersRound,
  SlidersHorizontal,
  LayoutGrid,
  List,
  BriefcaseBusiness,
  Eye,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { attendancePermissionsApi, type HrRecord } from "../api/hr.api";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { MonthPicker } from "@/shared/components/ui/month-picker";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { storedUser } from "@/features/auth/access";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  duration,
  employeeLabel,
  lostMinutes,
  monthValue,
  scheduleForDay,
  scheduledMinutes,
} from "./monthly-hr";

const time = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Baghdad",
      }).format(new Date(String(value)))
    : "—";

const deviceUserCount = (employee: HrRecord) =>
  Number(
    (employee._count as { devicePeople?: number } | undefined)?.devicePeople ??
      0,
  );

export default function HrAttendancePage() {
  const { t, i18n } = useTranslation();
  const tx = (key: string, fallback: string) =>
    t(`hrMonthly.${key}`, { defaultValue: fallback });
  const canDeletePermission = storedUser()?.roles?.some(
    (role) => role.name === "Super Administrator",
  );
  const [deletingPermission, setDeletingPermission] = useState<HrRecord | null>(
    null,
  );
  const [viewingPermission, setViewingPermission] = useState<HrRecord | null>(
    null,
  );
  const canManage = hasPermission(
    storedUser(),
    "hr.attendance-permissions.create",
  );
  const [month, setMonth] = useState(monthValue());
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [directoryView, setDirectoryView] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<HrRecord>();
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [employeePermissions, setEmployeePermissions] = useState<HrRecord[]>([]);
  const [permissionType, setPermissionType] = useState("full_day");
  const table = useServerTable<
    HrRecord,
    {
      records: HrRecord[];
      permissions: HrRecord[];
      departments: [string, string][];
      totals: { employees: number; linked: number; lost: number };
    }
  >("/employees/records/attendance/monthly-report", {
    month,
    search,
    departmentId: departmentFilter,
    attendance: attendanceFilter,
    selectedId: selected?.id,
  });
  const visible = table.data ?? [];
  const linkedEmployees = new Set(
    visible
      .filter((employee) => deviceUserCount(employee) > 0)
      .map((employee) => employee.id),
  );
  const monthRecords = table.pageData?.records ?? [];
  const permissions = {
    data: table.pageData?.permissions ?? [],
    refresh: table.refresh,
  };
  const permissionDates = [
    ...(permissions.data ?? []),
    ...employeePermissions,
  ]
    .filter(
      (permission) =>
        permission.employeeId === selected?.id &&
        permission.status === "approved",
    )
    .map((permission) => {
      const date = String(permission.fromDate).slice(0, 10);
      const [year, month, day] = date.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
  const departmentOptions = table.pageData?.departments ?? [];
  const recordsFor = (id: string) =>
    monthRecords.filter((x) => x.employeeId === id);
  const [year, monthNumber] = month.split("-").map(Number);
  const days = Array.from(
    { length: new Date(year, monthNumber, 0).getDate() },
    (_, index) => new Date(year, monthNumber - 1, index + 1),
  );
  const firstOffset = new Date(year, monthNumber - 1, 1).getDay();
  const selectedRecords = selected ? recordsFor(selected.id) : [];
  const selectedWorked = selectedRecords.reduce(
    (total, record) => total + Number(record.workedMinutes ?? 0),
    0,
  );
  const selectedLost = selectedRecords.reduce(
    (total, record) => total + lostMinutes(record, permissions.data ?? []),
    0,
  );
  const totalLost = table.pageData?.totals.lost ?? 0;
  const isLoading = table.isLoading;
  const grantPermission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    try {
      await attendancePermissionsApi.create({
        employeeId: selected.id,
        permissionType,
        fromDate: String(form.get("date")),
        toDate: String(form.get("date")),
        permittedMinutes:
          permissionType === "hours"
            ? Number(form.get("hours") ?? 0) * 60
            : null,
        reason: String(form.get("reason") ?? "") || null,
        status: "approved",
      });
      setPermissionOpen(false);
      await permissions.refresh();
      toast.success(tx("permissionGranted", "Attendance permission granted."));
    } catch {
      toast.error(
        tx("permissionError", "Unable to grant attendance permission."),
      );
    }
  };
  const openGrantPermission = async () => {
    if (!selected) return;
    try {
      const existing = await attendancePermissionsApi.list({
        employeeId: selected.id,
        status: "approved",
      });
      setEmployeePermissions(existing);
    } catch {
      setEmployeePermissions([]);
    }
    setPermissionOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-primary/12 via-background to-background p-6 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <CalendarDays className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {tx("workforce", "Workforce")}
                </p>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {tx("attendanceTitle", "Employee attendance")}
                </h1>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {tx(
                "attendanceSubtitle",
                "Select an employee to view check-ins, check-outs and lost time for every day of the month.",
              )}
            </p>
          </div>
          <label className="space-y-1.5 text-xs font-semibold">
            <span className="text-muted-foreground">
              {tx("attendanceMonth", "Attendance month")}
            </span>
            <MonthPicker
              value={month}
              onValueChange={setMonth}
              locale={i18n.resolvedLanguage}
              label={tx("attendanceMonth", "Attendance month")}
              className="w-full min-w-52"
            />
          </label>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border bg-background/80 p-4 backdrop-blur">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <UsersRound className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">
                {tx("totalEmployees", "Employees")}
              </p>
              <p className="text-xl font-bold">
                {table.pageData?.totals.employees ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-background/80 p-4 backdrop-blur">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Link2 className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">
                {tx("linkedEmployees", "Device linked")}
              </p>
              <p className="text-xl font-bold">
                {table.pageData?.totals.linked ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-background/80 p-4 backdrop-blur">
            <span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-600">
              <TimerOff className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">
                {tx("monthlyLostTime", "Monthly lost time")}
              </p>
              <p className="text-xl font-bold text-destructive">
                {duration(totalLost)}
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {tx("employeeDirectory", "Employee directory")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tx(
              "selectCard",
              "Select a card to open monthly attendance details.",
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <p className="me-2 text-xs text-muted-foreground" role="status">
            {t("hrMonthly.filteredEmployees", {
              count: table.pagination.total,
              total: table.pageData?.totals.employees ?? 0,
            })}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-11 shrink-0 rounded-xl">
                <SlidersHorizontal className="size-4" />
                {tx("filters", "Filters")}
                {(departmentFilter !== "all" || attendanceFilter !== "all") && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {Number(departmentFilter !== "all") +
                      Number(attendanceFilter !== "all")}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-[calc(100vh-2rem)] w-[min(18rem,calc(100vw-2rem))] space-y-4 overflow-y-auto p-4"
              align="end"
              collisionPadding={12}
              dir={i18n.dir()}
            >
              <div className="space-y-2">
                <Label htmlFor="attendance-department-filter">
                  {tx("filterDepartment", "Department")}
                </Label>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                  dir={i18n.dir()}
                >
                  <SelectTrigger
                    id="attendance-department-filter"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {tx("allDepartments", "All departments")}
                    </SelectItem>
                    <SelectItem value="none">
                      {tx("noDepartment", "No department")}
                    </SelectItem>
                    {departmentOptions.map(([id, name]) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-status-filter">
                  {tx("monthlyAttendanceFilter", "Attendance in selected month")}
                </Label>
                <Select
                  value={attendanceFilter}
                  onValueChange={setAttendanceFilter}
                  dir={i18n.dir()}
                >
                  <SelectTrigger id="attendance-status-filter" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries({
                      all: "All employees",
                      recorded: "Has attendance records",
                      noRecords: "No attendance records",
                      late: "Late arrival",
                      missingCheckout: "Missing check-out",
                    }).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {tx(`attendanceFilter_${value}`, label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setDepartmentFilter("all");
                  setAttendanceFilter("all");
                }}
                disabled={
                  !search &&
                  departmentFilter === "all" &&
                  attendanceFilter === "all"
                }
              >
                {tx("clearFilters", "Clear filters")}
              </Button>
            </PopoverContent>
          </Popover>
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-xl bg-card ps-9 shadow-xs"
              aria-label={tx("searchEmployee", "Search employee or code…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx("searchEmployee", "Search employee or code…")}
            />
          </div>
          <div className="flex rounded-xl border bg-card p-1 shadow-xs">
            <Button
              size="sm"
              variant={directoryView === "grid" ? "default" : "ghost"}
              aria-pressed={directoryView === "grid"}
              onClick={() => setDirectoryView("grid")}
            >
              <LayoutGrid />
              {tx("gridView", "Grid")}
            </Button>
            <Button
              size="sm"
              variant={directoryView === "table" ? "default" : "ghost"}
              aria-pressed={directoryView === "table"}
              onClick={() => setDirectoryView("table")}
            >
              <List />
              {tx("tableView", "Table")}
            </Button>
          </div>
        </div>
      </div>
      {table.error && <p className="text-sm text-destructive">{table.error}</p>}
      {directoryView === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {isLoading &&
            Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-52 rounded-2xl" />
            ))}
          {visible.map((employee) => {
            const records = recordsFor(employee.id);
            const lost = records.reduce(
              (sum, row) => sum + lostMinutes(row, permissions.data ?? []),
              0,
            );
            return (
              <Button
                key={employee.id}
                variant="ghost"
                onClick={() => setSelected(employee)}
                className="group block h-auto min-w-0 whitespace-normal rounded-2xl p-0 text-start hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              >
                <Card className="h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-xs transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-md motion-reduce:transition-none">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-base font-bold text-primary ring-1 ring-inset ring-primary/10">
                        {String(employee.firstName ?? "E").charAt(0)}
                        {String(employee.lastName ?? "").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="line-clamp-2 text-sm font-semibold leading-5 text-foreground"
                          title={employeeLabel(employee)}
                        >
                          {employeeLabel(employee)}
                        </p>
                        <p className="mt-1 truncate text-xs font-normal text-muted-foreground">
                          {employee.user
                            ? `@${String((employee.user as HrRecord).username)}`
                            : tx("noSystemUser", "No system user")}
                        </p>
                      </div>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary rtl:-scale-x-100"
                      />
                    </div>
                    <div className="mt-4 flex min-w-0 items-center gap-2 text-xs font-normal text-muted-foreground">
                      <BriefcaseBusiness className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {String(
                          (employee.position as HrRecord | null)?.name ??
                            tx("noPosition", "No position"),
                        )}
                      </span>
                      <span className="ms-auto shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] font-medium tabular-nums text-foreground/70">
                        {String(employee.employeeCode)}
                      </span>
                    </div>
                  </CardContent>
                  <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/25 px-5 py-3">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-normal text-muted-foreground">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${linkedEmployees.has(employee.id) ? "bg-emerald-500" : "bg-muted-foreground/35"}`}
                        title={
                          linkedEmployees.has(employee.id)
                            ? tx("linked", "Linked")
                            : tx("notLinked", "Not linked")
                        }
                      />
                      <span className="truncate">
                        {deviceUserCount(employee)}{" "}
                        {tx("deviceUsers", "device users")}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground">
                      <Clock3 className="size-3.5" />
                      <span className="font-normal">
                        {tx("lostTime", "Lost time")}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {duration(lost)}
                      </span>
                    </span>
                  </div>
                </Card>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tx("employee", "Employee")}</TableHead>
                <TableHead>{tx("employeeCode", "Code")}</TableHead>
                <TableHead>{tx("position", "Position")}</TableHead>
                <TableHead>{tx("account", "Account")}</TableHead>
                <TableHead>{tx("deviceUsers", "Device users")}</TableHead>
                <TableHead className="text-end">
                  {tx("lostTime", "Lost time")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {visible.map((employee) => {
                const lost = recordsFor(employee.id).reduce(
                  (sum, row) => sum + lostMinutes(row, permissions.data ?? []),
                  0,
                );
                return (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(employee)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 font-bold text-primary">
                          {String(employee.firstName ?? "E").charAt(0)}
                          {String(employee.lastName ?? "").charAt(0)}
                        </span>
                        <span className="font-semibold">
                          {employeeLabel(employee)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{String(employee.employeeCode)}</TableCell>
                    <TableCell>
                      {String(
                        (employee.position as HrRecord | null)?.name ??
                          tx("noPosition", "No position"),
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.user
                        ? `@${String((employee.user as HrRecord).username)}`
                        : tx("noSystemUser", "No system user")}
                    </TableCell>
                    <TableCell>{deviceUserCount(employee)}</TableCell>
                    <TableCell
                      className={`text-end font-semibold tabular-nums ${lost > 0 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {duration(lost)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationControls {...table.pagination} />
      {!isLoading && !visible.length && (
        <div className="rounded-3xl border border-dashed py-16 text-center">
          <Search className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-semibold">
            {tx("noEmployeesFound", "No employees found")}
          </p>
          <p className="text-sm text-muted-foreground">
            {tx("tryAnotherSearch", "Try another name or employee code.")}
          </p>
        </div>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
      >
        <DialogContent className="flex max-h-[94dvh] w-[min(96vw,1440px)] max-w-none flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-none">
          <div className="shrink-0 border-b bg-card px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pe-8">
              <DialogHeader className="min-w-0 flex-1 text-start">
                <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <CalendarDays className="size-6" />
                  </span>
                  <span>
                    <span className="block">
                      {selected && employeeLabel(selected)}
                    </span>
                    <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
                      {String(selected?.employeeCode ?? "")} ·{" "}
                      {new Intl.DateTimeFormat(undefined, {
                        month: "long",
                        year: "numeric",
                      }).format(new Date(year, monthNumber - 1))}
                      {" · "}
                      {tx("schedule", "Schedule")}:{" "}
                      {selected?.scheduleType === "dynamic"
                        ? t("employeeSchedule.dynamic")
                        : `${String(selected?.checkInTime ?? "09:00")}–${String(selected?.checkOutTime ?? "17:00")}`}
                    </span>
                  </span>
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl border bg-muted/25 rtl:divide-x-reverse">
              <div className="min-w-0 px-3 py-3 sm:px-5">
                <p className="text-xs font-medium text-muted-foreground">
                  {tx("recordedDays", "Recorded days")}
                </p>
                <p className="mt-1 text-base font-semibold tabular-nums sm:text-xl">
                  {selectedRecords.length}
                </p>
              </div>
              <div className="min-w-0 px-3 py-3 sm:px-5">
                <p className="text-xs font-medium text-muted-foreground">
                  {tx("workedTime", "Worked time")}
                </p>
                <p className="mt-1 text-base font-semibold tabular-nums sm:text-xl text-emerald-600">
                  {duration(selectedWorked)}
                </p>
              </div>
              <div className="min-w-0 px-3 py-3 sm:px-5">
                <p className="text-xs font-medium text-muted-foreground">
                  {tx("lostTime", "Lost time")}
                </p>
                <p className="mt-1 text-base font-semibold tabular-nums sm:text-xl text-primary">
                  {duration(selectedLost)}
                </p>
              </div>
            </div>
            {selected &&
              permissions.data?.some(
                (permission) => permission.employeeId === selected.id,
              ) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {permissions.data
                    .filter(
                      (permission) => permission.employeeId === selected.id,
                    )
                    .map((permission) => (
                      <div key={permission.id} className="flex items-center gap-1">
                        <Badge variant="outline" className="gap-2 bg-background py-1.5">
                          <ShieldCheck className="size-3.5 text-emerald-600" />
                          {tx(
                            String(permission.permissionType),
                            String(permission.permissionType).replaceAll(
                              "_",
                              " ",
                            ),
                          )}
                          : {String(permission.fromDate).slice(0, 10)}
                          {String(permission.fromDate).slice(0, 10) !==
                            String(permission.toDate).slice(0, 10) &&
                            ` — ${String(permission.toDate).slice(0, 10)}`}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7 shrink-0 rounded-full border-emerald-200 bg-background p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          type="button"
                          aria-label={tx("viewPermissionDetails", "View permission details")}
                          title={tx("viewPermissionDetails", "View permission details")}
                          onClick={() => setViewingPermission(permission)}
                        >
                          <Eye className="size-3.5 text-primary" />
                        </Button>
                        {canDeletePermission && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 shrink-0 rounded-full border-destructive/20 bg-background p-0"
                            permission="hr.attendance-permissions.delete"
                            data-action="delete"
                            type="button"
                            aria-label={t("common.delete")}
                            onClick={() => setDeletingPermission(permission)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              )}
          </div>
          <div className="content-scrollbar min-h-0 flex-1 overflow-auto bg-muted/20 p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <CalendarDays className="size-4 text-primary" />
                {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                  month: "long",
                  year: "numeric",
                }).format(new Date(year, monthNumber - 1))}
              </h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" />
                  {tx("recordedDays", "Recorded days")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-destructive" />
                  {tx("lostTime", "Lost time")}
                </span>
              </div>
            </div>
            <div className="min-w-[840px] overflow-hidden rounded-xl border bg-border/70 shadow-xs">
              <div className="grid grid-cols-7 gap-px border-b text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {Array.from({ length: 7 }, (_, i) => (
                  <div className="bg-muted px-3 py-3" key={i}>
                    {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                      weekday: "short",
                    }).format(new Date(2024, 0, 7 + i))}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {Array.from({ length: firstOffset }, (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="bg-muted/70"
                    aria-hidden="true"
                  />
                ))}
                {days.map((day) => {
                  const schedule = selected
                    ? scheduleForDay(selected, day.getDay())
                    : null;
                  const dateKey = `${month}-${String(day.getDate()).padStart(2, "0")}`;
                  const row = recordsFor(selected?.id ?? "").find(
                    (x) => String(x.attendanceDate).slice(0, 10) === dateKey,
                  );
                  const dayPermissions = (permissions.data ?? []).filter(
                    (permission) =>
                      permission.employeeId === selected?.id &&
                      permission.status === "approved" &&
                      String(permission.fromDate).slice(0, 10) <= dateKey &&
                      String(permission.toDate).slice(0, 10) >= dateKey,
                  );
                  const lost = row
                    ? lostMinutes(row, permissions.data ?? [])
                    : 0;
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={dateKey}
                      aria-current={isToday ? "date" : undefined}
                      className={`relative min-h-36 p-3 ${isToday ? "bg-primary/5 ring-2 ring-inset ring-primary" : row ? "bg-card" : "bg-background"}`}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                        <span
                          className={`grid size-8 place-items-center rounded-full text-sm font-semibold tabular-nums ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                        >
                          {day.getDate()}
                        </span>
                        {row && (
                          <Badge
                            variant="secondary"
                            className={`max-w-full whitespace-normal px-2 py-0.5 text-[10px] ${lost > 0 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                          >
                            {t(`hr.${String(row.status)}`, {
                              defaultValue: String(row.status),
                            })}
                          </Badge>
                        )}
                      </div>
                      <p className="mb-3 text-[11px] tabular-nums text-muted-foreground">
                        {schedule
                          ? selected?.scheduleType === "dynamic"
                            ? t("employeeSchedule.hours", {
                                count: scheduledMinutes(schedule) / 60,
                              })
                            : `${String(schedule.checkInTime)}–${String(schedule.checkOutTime)}`
                          : t("employeeSchedule.dayOff", {
                              defaultValue: "Day off",
                            })}
                      </p>
                      {row ? (
                        <div className="space-y-2 text-xs tabular-nums">
                          {dayPermissions.map((permission) =>
                            permission.reason ? (
                              <p
                                key={permission.id}
                                className="line-clamp-2 rounded-md bg-emerald-50 px-2 py-1 text-[11px] leading-snug text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                                title={String(permission.reason)}
                              >
                                <span className="font-semibold">
                                  {tx("reason", "Reason")}:
                                </span>{" "}
                                {String(permission.reason)}
                              </p>
                            ) : null,
                          )}
                          <div className="flex items-center justify-between gap-1 text-muted-foreground">
                            <LogIn className="size-3.5 text-emerald-600" />
                            <span>{time(row.checkIn)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-muted-foreground">
                            <LogOut className="size-3.5 text-amber-600" />
                            <span>{time(row.checkOut)}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-1 border-t pt-1 font-semibold">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock3 className="size-3.5" />
                              {tx("worked", "Worked")}
                            </span>
                            <span>
                              {duration(Number(row.workedMinutes ?? 0))}
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between gap-1 font-semibold ${lost ? "text-destructive" : "text-emerald-600"}`}
                          >
                            <span className="flex items-center gap-1">
                              <TimerOff className="size-3.5" />
                              {tx("lost", "Lost")}
                            </span>
                            <span>{duration(lost)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-10 items-end">
                          <div className="space-y-1">
                            {dayPermissions.length ? (
                              dayPermissions.map((permission) => (
                                <div key={permission.id}>
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    {tx(
                                      String(permission.permissionType),
                                      String(permission.permissionType).replaceAll(
                                        "_",
                                        " ",
                                      ),
                                    )}
                                  </span>
                                  {permission.reason ? (
                                    <p
                                      className="mt-1 max-w-full break-words text-[11px] leading-snug text-muted-foreground"
                                      title={String(permission.reason)}
                                    >
                                      {String(permission.reason)}
                                    </p>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <span className="rounded-full bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground/80">
                                {!schedule
                                  ? t("employeeSchedule.dayOff", {
                                      defaultValue: "Day off",
                                    })
                                  : tx("noRecord", "No record")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {Array.from(
                  { length: (7 - ((firstOffset + days.length) % 7)) % 7 },
                  (_, i) => (
                    <div
                      key={`trailing-${i}`}
                      className="bg-muted/70"
                      aria-hidden="true"
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          {canManage && (
            <div className="shrink-0 border-t bg-card px-4 py-3 sm:px-6">
              <Button
                permission="hr.attendance-permissions.create"
                className="w-full rounded-xl sm:ms-auto sm:w-auto"
                onClick={openGrantPermission}
              >
                <ShieldCheck /> {tx("grantPermission", "Grant permission")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        permission="hr.attendance-permissions.delete"
        alwaysRequirePassword
        key={deletingPermission?.id ?? "no-permission"}
        open={!!deletingPermission}
        title={t("common.deletePermanently")}
        description={
          deletingPermission
            ? `${tx(String(deletingPermission.permissionType), String(deletingPermission.permissionType))}: ${String(deletingPermission.fromDate).slice(0, 10)} — ${String(deletingPermission.toDate).slice(0, 10)}`
            : ""
        }
        onOpenChange={(open) => {
          if (!open) setDeletingPermission(null);
        }}
        onConfirm={async (password) => {
          if (!deletingPermission) return;
          await attendancePermissionsApi.remove(
            deletingPermission.id,
            password,
          );
          await permissions.refresh();
        }}
      />
      <Dialog open={permissionOpen} onOpenChange={setPermissionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {tx("grantPermission", "Grant attendance permission")}
            </DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={grantPermission}>
            <Label className="grid gap-2">
              {tx("permissionType", "Permission type")}
              <Select value={permissionType} onValueChange={setPermissionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">
                    {tx("full_day", "Full day")}
                  </SelectItem>
                  <SelectItem value="hours">{tx("hours", "Hours")}</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            <Label className="grid gap-2">
              {tx("date", "Date")}
              <FormDatePicker
                name="date"
                required
                disabledDates={permissionDates}
              />
            </Label>
            {permissionType === "hours" && (
              <Label className="grid gap-2">
                {tx("permittedHours", "Permitted hours per day")}
                <Input
                  name="hours"
                  type="number"
                  min="0.25"
                  max="24"
                  step="0.25"
                  required
                />
              </Label>
            )}
            <Label className="grid gap-2">
              {tx("reason", "Reason")}
              <Textarea name="reason" />
            </Label>
            <Button permission="hr.attendance-permissions.create" type="submit">
              <ShieldCheck />
              {tx("savePermission", "Save permission")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!viewingPermission}
        onOpenChange={(open) => {
          if (!open) setViewingPermission(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tx("permissionDetails", "Permission details")}
            </DialogTitle>
          </DialogHeader>
          {viewingPermission && (
            <div className="mt-4 space-y-3 text-sm">
              <p className="font-semibold">
                {tx(
                  String(viewingPermission.permissionType),
                  String(viewingPermission.permissionType).replaceAll("_", " "),
                )}
              </p>
              <p className="text-muted-foreground">
                {String(viewingPermission.fromDate).slice(0, 10)}
                {String(viewingPermission.fromDate).slice(0, 10) !==
                  String(viewingPermission.toDate).slice(0, 10) &&
                  ` — ${String(viewingPermission.toDate).slice(0, 10)}`}
              </p>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  {tx("reason", "Reason")}
                </p>
                <p className="whitespace-pre-wrap break-words">
                  {String(
                    viewingPermission.reason ||
                      tx("noReasonProvided", "No reason provided"),
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
