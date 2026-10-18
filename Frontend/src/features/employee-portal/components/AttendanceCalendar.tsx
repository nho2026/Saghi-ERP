import { createContext, useCallback, useContext, useState } from "react";
import { DayButton, type DayButtonProps } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { CalendarDays, LogIn, LogOut } from "lucide-react";
import { Calendar } from "@/shared/components/ui/calendar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
import { useApiResource } from "@/shared/hooks/useApiResource";
import {
  employeePortalApi,
  type MyAttendanceRecord,
} from "../api/employee-portal.api";

const AttendanceDays = createContext<MyAttendanceRecord[]>([]);

function AttendanceDayButton({ children, ...props }: DayButtonProps) {
  const records = useContext(AttendanceDays);
  const { t, i18n } = useTranslation();
  const record = records.find(
    (item) => item.attendanceDate === dateKey(props.day.date),
  );
  const time = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
          timeZone: "Asia/Baghdad",
        }).format(new Date(value))
      : "—";
  const details = record
    ? `${t("hr.checkIn")}: ${time(record.checkIn)}, ${t("hr.checkOut")}: ${time(record.checkOut)}`
    : "";
  return (
    <DayButton
      {...props}
      aria-label={`${props["aria-label"] ?? ""}${details ? `, ${details}` : ""}`}
      title={details || undefined}
    >
      <span>{children}</span>
      {record && (
        <span className="mt-1 flex w-full flex-col items-center gap-1 text-[10px] leading-none sm:text-xs">
          <span className="inline-flex items-center gap-0.5" dir="ltr">
            <LogIn className="size-3 shrink-0" aria-hidden="true" />
            <span>{time(record.checkIn)}</span>
          </span>
          <span className="inline-flex items-center gap-0.5" dir="ltr">
            <LogOut className="size-3 shrink-0" aria-hidden="true" />
            <span>{time(record.checkOut)}</span>
          </span>
        </span>
      )}
    </DayButton>
  );
}

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const baghdadToday = () => {
  const date = new Date(Date.now() + 3 * 3600000);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};
const statusColors: Record<string, string> = {
  present: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  absent: "bg-red-500/15 text-red-800 dark:text-red-300",
  leave: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  holiday: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
};

export function AttendanceCalendar() {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState(baghdadToday);
  const [selected, setSelected] = useState<Date | undefined>(baghdadToday);
  const monthKey = dateKey(month).slice(0, 7);
  const attendance = useApiResource(
    useCallback(() => employeePortalApi.attendance(monthKey), [monthKey]),
  );
  const l = (key: string) => t(`employeePortal.attendance.${key}`);
  const records = attendance.data?.records ?? [];
  const selectedRecord = records.find(
    (record) => record.attendanceDate === (selected && dateKey(selected)),
  );
  const number = (value: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage).format(value);
  const time = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Baghdad",
        }).format(new Date(value))
      : "—";
  const duration = (minutes: number) =>
    t("employeePortal.attendance.duration", {
      hours: number(Math.floor(minutes / 60)),
      minutes: number(minutes % 60),
    });
  const ready = !attendance.isLoading && !attendance.error;

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="size-5 text-primary" />
          {l("title")}
        </CardTitle>
        <CardDescription>{l("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <AttendanceDays.Provider value={ready ? records : []}>
              <Calendar
                components={{ DayButton: AttendanceDayButton }}
                mode="single"
                required
                month={month}
                onMonthChange={(value) => {
                  setMonth(value);
                  setSelected(value);
                }}
                selected={selected}
                onSelect={setSelected}
                today={baghdadToday()}
                showOutsideDays={false}
                className="w-full rounded-xl border"
                classNames={{
                  weekday:
                    "flex-1 text-center text-xs font-normal text-muted-foreground",
                  day: "relative min-w-0 flex-1 p-0.5 text-center text-sm",
                  day_button:
                    "flex min-h-24 w-full flex-col items-center justify-center rounded-md px-0.5 py-2 font-normal hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected:
                    "[&>button]:ring-2 [&>button]:ring-primary [&>button]:font-bold",
                  today: "[&>button]:underline [&>button]:underline-offset-4",
                }}
                modifiers={Object.fromEntries(
                  Object.keys(statusColors).map((status) => [
                    status,
                    ready
                      ? records
                          .filter((record) => record.status === status)
                          .map(
                            (record) =>
                              new Date(`${record.attendanceDate}T12:00:00`),
                          )
                      : [],
                  ]),
                )}
                modifiersClassNames={statusColors}
              />
            </AttendanceDays.Provider>
            <div className="mt-3 flex flex-wrap gap-2" aria-label={l("legend")}>
              {Object.entries(statusColors).map(([status, color]) => (
                <Badge key={status} variant="secondary" className={color}>
                  {t(`hr.${status}`)}
                </Badge>
              ))}
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <LogIn className="size-3" />
                {t("hr.checkIn")}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <LogOut className="size-3" />
                {t("hr.checkOut")}
              </span>
            </div>
          </div>
          <div
            className="space-y-4"
            aria-live="polite"
            aria-busy={attendance.isLoading}
          >
            <ResourceState
              isLoading={attendance.isLoading}
              error={attendance.error}
              isEmpty={false}
            />
            {attendance.error && (
              <Button
                variant="outline"
                onClick={() => void attendance.refresh()}
              >
                {t("common.retry")}
              </Button>
            )}
            {ready && !attendance.data?.linked && (
              <p className="text-sm text-muted-foreground">{l("notLinked")}</p>
            )}
            {ready && attendance.data?.linked && (
              <>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>
                    {t("hrMonthly.recordedDays")}: {number(records.length)}
                  </span>
                  <span>
                    {t("hrMonthly.workedTime")}:{" "}
                    {duration(
                      records.reduce(
                        (sum, record) => sum + record.workedMinutes,
                        0,
                      ),
                    )}
                  </span>
                </div>
                {!records.length && (
                  <p className="text-sm text-muted-foreground">
                    {l("emptyMonth")}
                  </p>
                )}
                <div className="rounded-xl border p-4">
                  <p className="mb-3 font-medium">
                    {selected &&
                      new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                        dateStyle: "full",
                        calendar: "gregory",
                      }).format(selected)}
                  </p>
                  {selectedRecord ? (
                    <>
                      <Badge
                        variant="secondary"
                        className={statusColors[selectedRecord.status]}
                      >
                        {t(`hr.${selectedRecord.status}`, {
                          defaultValue: selectedRecord.status,
                        })}
                      </Badge>
                      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {[
                          [t("hr.checkIn"), time(selectedRecord.checkIn)],
                          [t("hr.checkOut"), time(selectedRecord.checkOut)],
                          [
                            t("hrMonthly.workedTime"),
                            duration(selectedRecord.workedMinutes),
                          ],
                          [
                            t("hr.lateMinutes"),
                            number(selectedRecord.lateMinutes),
                          ],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="mt-1 font-medium">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("hrMonthly.noRecord")}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{l("timezone")}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
