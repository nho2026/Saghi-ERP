import { useServerTable } from "@/shared/hooks/useServerTable";
import type { AttendanceEvent } from "../api/attendance.api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, format, subMonths } from "date-fns";
import {
  ArrowUpDown,
  Check,
  CalendarRange,
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  attendanceApi,
  attendanceEventsStreamUrl,
  type Person,
} from "../api/attendance.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { apiErrorMessage } from "@/shared/api/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
type EmployeeOption = {
  id: string;
  employeeNo: string;
  name: string;
  deviceName: string;
};
function currentEmployees(people: Person[]) {
  const employees = new Map<string, EmployeeOption>();
  for (const person of people)
    employees.set(person.employeeNo, {
      id: person.id,
      employeeNo: person.employeeNo,
      name: person.name,
      deviceName: person.device?.name ?? "",
    });
  return [...employees.values()].sort((a, b) =>
    a.employeeNo.localeCompare(b.employeeNo, undefined, { numeric: true }),
  );
}
function DateRangeFilter({
  range,
  onChange,
}: {
  range?: DateRange;
  onChange: (range?: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(range);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    range?.from ?? new Date(),
  );
  const { t, i18n } = useTranslation();
  const dateLabel = (date: Date) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  const label = range?.from
    ? range.to
      ? `${dateLabel(range.from)} — ${dateLabel(range.to)}`
      : `${dateLabel(range.from)} — ${t("datePicker.pickDate")}`
    : t("attendanceFilters.pickDateRange", {
        defaultValue: "Select date range",
      });
  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setDraft(range);
          setCalendarMonth(range?.from ?? new Date());
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[290px] max-w-full justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarRange className="size-4 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[292px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl p-0 shadow-xl"
        align="start"
      >
        <div className="border-b bg-muted/35 px-3 py-2.5">
          <p className="text-xs font-semibold">
            {t("attendanceFilters.chooseDateRange", {
              defaultValue: "Choose date range",
            })}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {t("attendanceFilters.chooseStartEnd", {
              defaultValue: "Select a start date, then an end date",
            })}
          </p>
        </div>
        <div className="flex items-center justify-between px-3 pt-3">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-7"
            onClick={() => setCalendarMonth((month) => subMonths(month, 1))}
            aria-label={t("datePicker.previousMonth", {
              defaultValue: "Previous month",
            })}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <strong className="text-xs">
            {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
              month: "long",
              year: "numeric",
            }).format(calendarMonth)}
          </strong>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-7"
            onClick={() => setCalendarMonth((month) => addMonths(month, 1))}
            aria-label={t("datePicker.nextMonth", {
              defaultValue: "Next month",
            })}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          hideNavigation
          numberOfMonths={1}
          className="relative w-full p-3"
          classNames={{
            month: "w-full space-y-2",
            month_caption: "hidden",
            month_grid: "w-full border-collapse",
            weekdays: "grid grid-cols-7",
            weekday:
              "text-center text-[9px] font-semibold uppercase text-muted-foreground",
            week: "mt-0.5 grid grid-cols-7",
            day: "relative grid h-8 place-items-center p-0 text-center text-xs",
            day_button:
              "grid size-8 place-items-center rounded-md font-medium transition-colors duration-150 hover:bg-primary/10 hover:text-primary",
            selected: "bg-transparent text-foreground",
            range_start:
              "bg-transparent! text-primary-foreground! [&>button]:bg-primary! [&>button]:text-primary-foreground! [&>button:hover]:bg-primary!",
            range_end:
              "bg-transparent! text-primary-foreground! [&>button]:bg-primary! [&>button]:text-primary-foreground! [&>button:hover]:bg-primary!",
            range_middle:
              "bg-transparent! text-foreground! [&>button]:bg-primary/8! [&>button:hover]:bg-primary/18! [&>button:hover]:text-primary!",
          }}
        />
        <div className="flex items-center gap-1.5 border-t bg-muted/20 p-2.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(undefined);
              onChange(undefined);
              setOpen(false);
            }}
          >
            {t("common.clear", { defaultValue: "Clear" })}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ms-auto"
            onClick={() => setOpen(false)}
          >
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!draft?.from || !draft?.to}
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            {t("common.apply", { defaultValue: "Apply" })}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
function EmployeeFilter({
  options,
  value,
  onChange,
}: {
  options: EmployeeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState("");
  const { t } = useTranslation();
  const selected = options.find((x) => x.employeeNo === value),
    filtered = options.filter((x) =>
      `${x.name} ${x.employeeNo} ${x.deviceName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setSearch("");
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[220px] justify-between font-normal"
        >
          <span className="truncate">
            {selected
              ? `${selected.name} · #${selected.employeeNo}`
              : t("attendanceFilters.allEmployees")}
          </span>
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="relative border-b p-2">
          <Search className="absolute inset-s-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("attendanceFilters.searchEmployee")}
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            onClick={() => pick("")}
          >
            <UsersRound />
            <span className="flex-1 text-start">
              {t("attendanceFilters.allEmployees")}
            </span>
            {!value && <Check className="text-primary" />}
          </button>
          {filtered.map((x) => (
            <button
              key={x.id}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start hover:bg-muted"
              onClick={() => pick(x.employeeNo)}
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {x.name
                  .split(" ")
                  .map((v) => v[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-xs">{x.name}</b>
                <small className="text-[10px] text-muted-foreground">
                  #{x.employeeNo} · {x.deviceName}
                </small>
              </span>
              {value === x.employeeNo && <Check className="text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const [initialRange] = useState(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Baghdad",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const value = (type: string) =>
      parts.find((part) => part.type === type)!.value;
    const month = `${value("year")}-${value("month")}`;
    return { from: `${month}-01`, to: `${month}-${value("day")}` };
  });
  const [filters, setFilters] = useState<Record<string, string>>(initialRange),
    [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
      from: new Date(`${initialRange.from}T00:00:00`),
      to: new Date(`${initialRange.to}T00:00:00`),
    })),
    [syncing, setSyncing] = useState(false),
    [dateSort, setDateSort] = useState<"desc" | "asc">("desc");
  const devices = useApiResource(
    useCallback(() => attendanceApi.devices(), []),
  );
  const selectedDeviceId = filters.deviceId || devices.data?.[0]?.id || "";
  const deviceFilters = useMemo(
    () => ({ ...filters, deviceId: selectedDeviceId }),
    [filters, selectedDeviceId],
  );
  const events = useServerTable<AttendanceEvent>(
      "/attendance/events",
      { ...deviceFilters, sort: dateSort },
      Boolean(selectedDeviceId),
    ),
    people = useApiResource(
      useCallback(
        () =>
          selectedDeviceId
            ? attendanceApi.people(selectedDeviceId)
            : Promise.resolve([]),
        [selectedDeviceId],
      ),
    );
  const visibleEvents = useMemo(() => {
    const from = filters.from
      ? new Date(`${filters.from}T00:00:00+03:00`).getTime()
      : Number.NEGATIVE_INFINITY;
    const to = filters.to
      ? new Date(`${filters.to}T23:59:59.999+03:00`).getTime()
      : Number.POSITIVE_INFINITY;
    return (events.data ?? [])
      .filter((event) => {
        const occurredAt = new Date(event.occurredAt).getTime();
        return (
          occurredAt >= from &&
          occurredAt <= to &&
          (!filters.employeeNo ||
            event.employeeNo.includes(filters.employeeNo)) &&
          (!filters.eventType || event.eventType === filters.eventType)
        );
      })
      .sort((a, b) => {
        const difference =
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
        return dateSort === "desc" ? difference : -difference;
      });
  }, [
    dateSort,
    events.data,
    filters.employeeNo,
    filters.eventType,
    filters.from,
    filters.to,
  ]);
  const verificationLabel = (value?: string) => {
    if (!value) return "—";
    const mode = value.replaceAll(/[^a-z]/gi, "").toLowerCase();
    if (["fp", "finger", "fingerprint"].includes(mode))
      return t("attendanceFilters.fingerprint");
    if (mode === "face") return t("attendanceFilters.face");
    if (mode === "card") return t("attendanceFilters.card");
    if (["pin", "pw", "password", "employeenoandpw"].includes(mode))
      return t("attendanceFilters.password");
    return "—";
  };
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = events.refresh;
    const stream = new EventSource(attendanceEventsStreamUrl(), {
      withCredentials: true,
    });
    stream.addEventListener("attendance", () => {
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        void refresh();
      }, 300);
    });
    return () => {
      clearTimeout(timer);
      stream.close();
    };
  }, [events.refresh]);
  const chooseDateRange = (range?: DateRange) => {
    setDateRange(range);
    setFilters((v) => ({
      ...v,
      from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    }));
  };
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-2 border-b p-4">
          <Select
            value={selectedDeviceId}
            disabled={syncing || !devices.data?.length}
            onValueChange={(deviceId) =>
              setFilters((value) => ({ ...value, deviceId, employeeNo: "" }))
            }
          >
            <SelectTrigger
              className="w-full sm:w-64"
              aria-label={t("table.headers.device")}
            >
              <SelectValue placeholder={t("deviceUsers.chooseDevice")} />
            </SelectTrigger>
            <SelectContent>
              {(devices.data ?? []).map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <EmployeeFilter
            options={currentEmployees(people.data ?? [])}
            value={filters.employeeNo ?? ""}
            onChange={(employeeNo) => setFilters((v) => ({ ...v, employeeNo }))}
          />
          <DateRangeFilter range={dateRange} onChange={chooseDateRange} />
          <Select
            value={filters.eventType || "all"}
            onValueChange={(eventType) =>
              setFilters((v) => ({
                ...v,
                eventType: eventType === "all" ? "" : eventType,
              }))
            }
          >
            <SelectTrigger className="w-[155px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("attendanceFilters.allEvents")}
              </SelectItem>
              <SelectItem value="check_in">
                {t("attendanceFilters.checkIn")}
              </SelectItem>
              <SelectItem value="check_out">
                {t("attendanceFilters.checkOut")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant="secondary"
            className="h-9 rounded-lg px-3 font-semibold tabular-nums"
          >
            {visibleEvents.length}{" "}
            {t("attendanceFilters.matchingEvents", {
              defaultValue: "matching events",
            })}
          </Badge>
          <Button
            permission="sync"
            variant="outline"
            className="ms-auto"
            disabled={syncing || !selectedDeviceId}
            onClick={async () => {
              setSyncing(true);
              try {
                const result = await attendanceApi.sync(deviceFilters);
                await Promise.all([events.refresh(), people.refresh()]);
                if (result.errors.length)
                  toast.warning(t("attendanceFilters.syncPartial"), {
                    description: result.errors
                      .map((error) => `${error.deviceName}: ${error.message}`)
                      .join(" · "),
                  });
                else
                  toast.success(
                    t("attendanceFilters.syncComplete", {
                      count: result.synced,
                    }),
                  );
              } catch (error) {
                toast.error(t("attendanceFilters.syncFailed"), {
                  description: apiErrorMessage(error),
                });
              } finally {
                setSyncing(false);
              }
            }}
          >
            <RefreshCw className={syncing ? "animate-spin" : ""} />
            {t("attendanceFilters.sync")}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.headers.employee")}</TableHead>
              <TableHead>{t("table.headers.event")}</TableHead>
              <TableHead>{t("table.headers.device")}</TableHead>
              <TableHead>{t("table.headers.verification")}</TableHead>
              <TableHead
                aria-sort={dateSort === "desc" ? "descending" : "ascending"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="-ms-3 h-8 gap-2 px-3"
                  onClick={() =>
                    setDateSort((current) =>
                      current === "desc" ? "asc" : "desc",
                    )
                  }
                >
                  Date & time
                  <ArrowUpDown className="size-3.5" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody {...events.tableProps}>
            <TableResourceState
              isLoading={events.isLoading}
              error={events.error}
              isEmpty={!visibleEvents.length}
              colSpan={5}
            />
            {!events.isLoading &&
              !events.error &&
              visibleEvents.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <b>{e.personName ?? t("attendanceFilters.unknownUser")}</b>
                    <small className="block text-muted-foreground">
                      #{e.employeeNo}
                    </small>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        e.eventType === "check_in"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {e.eventType === "check_in" ? <LogIn /> : <LogOut />}
                      {t(
                        e.eventType === "check_in"
                          ? "attendanceFilters.checkIn"
                          : "attendanceFilters.checkOut",
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.device.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="max-w-56 whitespace-normal text-center font-medium"
                      title={e.verification}
                    >
                      {verificationLabel(e.verification)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Baghdad",
                    }).format(new Date(e.occurredAt))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
