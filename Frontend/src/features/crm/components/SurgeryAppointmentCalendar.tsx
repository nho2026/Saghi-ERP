import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  HeartPulse,
  MapPin,
  Scissors,
  UserRound,
} from "lucide-react";
import type { CrmRecord } from "../api/crm.api";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

const colors: Record<string, string> = {
  scheduled:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  confirmed:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  in_progress:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};
const dots: Record<string, string> = {
  scheduled: "bg-teal-500",
  confirmed: "bg-teal-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
};
const name = (value: unknown) =>
  String((value as CrmRecord | undefined)?.name ?? "Not recorded");
const doctor = (appointment: CrmRecord) => {
  const employee = (appointment.doctor as CrmRecord | undefined)?.employee as
    CrmRecord | undefined;
  return employee
    ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim()
    : "Surgeon not assigned";
};

export function SurgeryAppointmentCalendar({
  appointments,
  onCreate,
  onEdit,
}: {
  appointments: CrmRecord[];
  onCreate: (day: Date) => void;
  onEdit: (appointment: CrmRecord) => void;
}) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });
  const forDay = (day: Date) =>
    appointments
      .filter((item) => isSameDay(new Date(String(item.scheduledAt)), day))
      .sort(
        (a, b) =>
          new Date(String(a.scheduledAt)).getTime() -
          new Date(String(b.scheduledAt)).getTime(),
      );
  const selected = forDay(selectedDay);
  const monthly = appointments.filter((item) =>
    isSameMonth(new Date(String(item.scheduledAt)), month),
  );
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="bg-linear-to-r from-violet-950 via-teal-950 to-teal-800 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/10">
              <Scissors />
            </span>
            <div>
              <p className="text-xs text-teal-200">
                {t("pageText.operatingSchedule")}
              </p>
              <h2 className="text-xl font-bold">
                {format(month, "MMMM yyyy")}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => {
                const now = new Date();
                setMonth(startOfMonth(now));
                setSelectedDay(now);
              }}
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => setMonth((value) => subMonths(value, 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => setMonth((value) => addMonths(value, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["Total", monthly.length],
            [
              "Scheduled",
              monthly.filter((x) => x.status === "scheduled").length,
            ],
            [
              "Confirmed",
              monthly.filter((x) => x.status === "confirmed").length,
            ],
            [
              "In surgery",
              monthly.filter((x) => x.status === "in_progress").length,
            ],
            [
              "Completed",
              monthly.filter((x) => x.status === "completed").length,
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-lg bg-white/10 px-3 py-2"
            >
              <p className="text-[10px] text-teal-200">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-x-auto bg-muted/10 p-4">
          <div className="min-w-[820px] overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-7 border-b bg-muted/40">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="border-e py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground last:border-0"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const items = forDay(day);
                const active = isSameDay(day, selectedDay);
                const today = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
                      onCreate(day);
                    }}
                    className={`group min-h-32 border-b border-e p-2 text-start hover:bg-violet-500/5 ${!isSameMonth(day, month) ? "bg-muted/20 opacity-40" : ""} ${active ? "shadow-[inset_0_0_0_2px_var(--primary)]" : ""}`}
                  >
                    <div className="mb-2 flex justify-between">
                      <span
                        className={`grid size-7 place-items-center rounded-full text-xs font-bold ${today ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        {format(day, "d")}
                      </span>
                      {items.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[9px]"
                        >
                          {items.length}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`truncate rounded-lg border px-2 py-1.5 text-[9px] font-semibold shadow-sm ${colors[String(item.status)] ?? colors.scheduled}`}
                        >
                          <span
                            className={`me-1 inline-block size-1.5 rounded-full ${dots[String(item.status)] ?? dots.scheduled}`}
                          />
                          {format(new Date(String(item.scheduledAt)), "HH:mm")}{" "}
                          · {name(item.surgery)}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-[9px] font-bold text-primary">
                          +{items.length - 3} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <aside className="border-s bg-muted/20 p-4">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Surgery agenda
            </p>
            <h3 className="mt-1 text-lg font-bold">
              {format(selectedDay, "EEEE, MMMM d")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selected.length} procedures scheduled
            </p>
          </div>
          <ScrollArea className="mt-4 h-[520px] pe-2">
            <div className="space-y-3 pe-2">
              {selected.length ? (
                selected.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onEdit(item)}
                    className="relative w-full overflow-hidden rounded-xl border bg-card p-4 ps-5 text-start shadow-sm hover:border-primary/40 hover:shadow-md"
                  >
                    <span
                      className={`absolute inset-y-0 inset-s-0 w-1 ${dots[String(item.status)] ?? dots.scheduled}`}
                    />
                    <div className="flex justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Clock3 className="size-4 text-primary" />
                        {format(new Date(String(item.scheduledAt)), "h:mm a")}
                      </span>
                      <Badge
                        variant="outline"
                        className={`capitalize ${colors[String(item.status)] ?? ""}`}
                      >
                        {String(item.status).replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <h4 className="mt-3 font-bold">{name(item.surgery)}</h4>
                    <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <UserRound className="size-3.5" />
                        {name(item.patient)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HeartPulse className="size-3.5" />
                        {doctor(item)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {String(item.operatingRoom ?? "Room not assigned")}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <Scissors className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm font-semibold">
                    Operating day available
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select this date to schedule surgery.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
