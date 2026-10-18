import { useState } from "react";
import { useTranslation } from "react-i18next";
import { settingsSnapshot } from "@/features/settings/settings";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { HrRecord } from "../api/hr.api";

type Day = {
  day: number;
  checkInTime?: string;
  checkOutTime?: string;
  hours?: number;
};
export function EmployeeScheduleFields({
  employee,
}: {
  employee?: HrRecord | null;
}) {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState(String(employee?.scheduleType ?? "static"));
  const [start, setStart] = useState(
    String(
      employee?.checkInTime ?? settingsSnapshot()?.hr.startTime ?? "08:00",
    ),
  );
  const [end, setEnd] = useState(
    String(employee?.checkOutTime ?? settingsSnapshot()?.hr.endTime ?? "15:00"),
  );
  const [days, setDays] = useState<Day[]>(() =>
    Array.isArray(employee?.workSchedule)
      ? (employee.workSchedule as Day[])
      : Array.from({ length: 7 }, (_, day) => ({
          day,
          checkInTime: start,
          checkOutTime: end,
        })).filter(
          ({ day }) =>
            !(settingsSnapshot()?.hr.weekends ?? [5, 6]).includes(day),
        ),
  );
  const [requiredHours, setRequiredHours] = useState<number | "">(
    () => days[0]?.hours ?? 4,
  );
  const schedule = days.map((day) =>
    type === "static"
      ? { day: day.day, checkInTime: start, checkOutTime: end }
      : {
          day: day.day,
          hours: Number(requiredHours),
        },
  );
  function hours(from: string, to: string) {
    const minutes = (value: string) => {
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
    };
    return ((minutes(to) - minutes(from) + 1440) % 1440) / 60;
  }
  return (
    <fieldset className="col-span-full min-w-0 space-y-4 rounded-xl border p-4">
      <legend className="px-1 text-sm font-medium">
        {t("employeeSchedule.title")}
      </legend>
      <input type="hidden" name="scheduleType" value={type} />
      <input
        type="hidden"
        name="workSchedule"
        value={JSON.stringify(schedule)}
      />
      <input type="hidden" name="checkInTime" value={start} />
      <input type="hidden" name="checkOutTime" value={end} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="employee-schedule-type">
            {t("employeeSchedule.type")}
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="employee-schedule-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">
                {t("employeeSchedule.static")}
              </SelectItem>
              <SelectItem value="dynamic">
                {t("employeeSchedule.dynamic")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type === "static" && (
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            <div>
              <Label htmlFor="schedule-start">
                {t("employeeSchedule.checkIn")}
              </Label>
              <Input
                id="schedule-start"
                type="time"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="schedule-end">
                {t("employeeSchedule.checkOut")}
              </Label>
              <Input
                id="schedule-end"
                type="time"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
        )}
        {type === "dynamic" && (
          <div className="space-y-1">
            <Label htmlFor="schedule-hours">
              {t("employeeSchedule.requiredHours")}
            </Label>
            <Input
              id="schedule-hours"
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              required
              value={requiredHours}
              onChange={(event) =>
                setRequiredHours(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            />
          </div>
        )}
      </div>
      <p className="text-sm font-medium">{t("employeeSchedule.days")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, day) => {
          const entry = days.find((item) => item.day === day);
          const label = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
            weekday: "long",
          }).format(new Date(2026, 0, 4 + day));
          return (
            <div
              key={day}
              className={`flex min-w-0 flex-wrap items-center gap-2 rounded-lg border p-3 ${entry ? "border-primary/25 bg-primary/5" : "bg-muted/30"}`}
            >
              <Checkbox
                id={`workday-${day}`}
                checked={!!entry}
                onCheckedChange={(checked) =>
                  setDays((current) =>
                    checked
                      ? [...current, { day, hours: 4 }].sort(
                          (a, b) => a.day - b.day,
                        )
                      : current.filter((item) => item.day !== day),
                  )
                }
              />
              <Label htmlFor={`workday-${day}`} className="cursor-pointer">
                {label}
              </Label>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {t("employeeSchedule.summary", {
          days: days.length,
          hours: Number(
            schedule
              .reduce(
                (sum, day) =>
                  sum +
                  (day.hours ??
                    hours(day.checkInTime ?? start, day.checkOutTime ?? end)),
                0,
              )
              .toFixed(2),
          ),
        })}
      </p>
    </fieldset>
  );
}
