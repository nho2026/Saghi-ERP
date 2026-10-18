import { settingsSnapshot } from "@/features/settings/settings";
import type { HrRecord } from "../api/hr.api";
import type {
  AttendanceEvent,
  Person,
} from "@/features/attendance/api/attendance.api";

const targetMinutes = () => settingsSnapshot()?.hr.targetMinutes ?? 480;
const penaltyMultiplier = () => settingsSnapshot()?.hr.penaltyMultiplier ?? 1;

export const monthValue = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const inMonth = (value: unknown, month: string) =>
  typeof value === "string" && value.slice(0, 7) === month;

export const lostMinutes = (record: HrRecord, permissions: HrRecord[] = []) => {
  const date = String(record.attendanceDate).slice(0, 10);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (date === today && !record.checkOut) return 0;
  const day = new Date(`${date}T12:00:00`).getDay();
  if (
    record.isWorkingDay === false ||
    (!record.hasWorkSchedule && settingsSnapshot()?.hr.weekends.includes(day))
  )
    return 0;
  const approved = permissions.filter(
    (permission) =>
      permission.employeeId === record.employeeId &&
      permission.status === "approved" &&
      String(permission.fromDate).slice(0, 10) <= date &&
      String(permission.toDate).slice(0, 10) >= date,
  );
  if (approved.some((permission) => permission.permissionType === "full_day"))
    return 0;
  if (record.status === "leave" || record.status === "holiday") return 0;
  let lost =
    record.status === "absent"
      ? Number(record.expectedMinutes ?? targetMinutes())
      : record.flexibleSchedule
        ? Number(record.missingMinutes ?? 0)
        : record.source === "device"
          ? Math.min(
              Number(record.expectedMinutes ?? targetMinutes()),
              Number(record.lateMinutes ?? 0) +
                Number(record.earlyLeaveMinutes ?? 0),
            )
          : Math.max(
              0,
              Number(record.expectedMinutes ?? targetMinutes()) -
                Number(record.workedMinutes ?? 0),
            );
  const permitted = approved
    .filter((permission) => permission.permissionType === "hours")
    .reduce(
      (sum, permission) => sum + Number(permission.permittedMinutes ?? 0),
      0,
    );
  lost = Math.max(0, lost - permitted);
  return lost;
};

export const scheduleForDay = (employee: HrRecord, day: number) => {
  if (!Array.isArray(employee.workSchedule)) return employee;
  const entry = (
    employee.workSchedule as {
      day: number;
      checkInTime: string;
      checkOutTime: string;
    }[]
  ).find((item) => item.day === day);
  if (!entry) return null;
  return employee.scheduleType === "dynamic"
    ? { ...employee, ...entry, workSchedule: undefined }
    : employee;
};

export const scheduledMinutes = (employee: HrRecord): number => {
  if (employee.scheduleType === "dynamic" && typeof employee.hours === "number")
    return Math.round(employee.hours * 60);
  if (
    employee.scheduleType === "dynamic" &&
    Array.isArray(employee.workSchedule) &&
    employee.workSchedule.length
  ) {
    return (
      employee.workSchedule.reduce(
        (sum: number, day: Record<string, unknown>) =>
          sum +
          scheduledMinutes({ ...employee, ...day, workSchedule: undefined }),
        0,
      ) / employee.workSchedule.length
    );
  }
  const [startHour, startMinute] = String(employee.checkInTime ?? "09:00")
    .split(":")
    .map(Number);
  const [endHour, endMinute] = String(employee.checkOutTime ?? "17:00")
    .split(":")
    .map(Number);
  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (end <= start) end += 1440;
  return end - start;
};

export const monthlyScheduledMinutes = (employee: HrRecord, month: string): number => {
  const [year, monthNumber] = month.split("-").map(Number);
  const weekends = settingsSnapshot()?.hr.weekends ?? [5, 6];
  let total = 0;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay();
    if (Array.isArray(employee.workSchedule)) {
      const entry = (employee.workSchedule as { day: number; hours?: number; checkInTime?: string; checkOutTime?: string }[])
        .find((item) => item.day === weekday);
      if (!entry) continue;
      total += scheduledMinutes(
        employee.scheduleType === "dynamic"
          ? { ...employee, ...entry, workSchedule: undefined }
          : employee,
      );
    } else if (!weekends.includes(weekday)) {
      total += scheduledMinutes(employee);
    }
  }
  return total;
};

export const duration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return `${hours}h ${rest}m`;
};

export const employeeLabel = (employee: HrRecord) =>
  `${String(employee.firstName ?? "")} ${String(employee.lastName ?? "")}`.trim();

export const activeSalaryFor = (
  employeeId: string,
  salaries: HrRecord[],
  month: string,
) => {
  const monthEnd = `${month}-31`;
  return salaries
    .filter(
      (salary) =>
        salary.employeeId === employeeId &&
        String(salary.effectiveFrom).slice(0, 10) <= monthEnd &&
        (!salary.effectiveTo ||
          String(salary.effectiveTo).slice(0, 7) >= month),
    )
    .sort((a, b) =>
      String(b.effectiveFrom).localeCompare(String(a.effectiveFrom)),
    )[0];
};

export const payrollAmounts = (
  baseSalary: number,
  minutesLost: number,
  monthlyScheduledHours: number,
  rewardAmount = 0,
  punishmentAmount = 0,
) => {
  const lostHours = minutesLost / 60;
  const hourlyRate = monthlyScheduledHours > 0 ? baseSalary / monthlyScheduledHours : 0;
  const deduction = hourlyRate * lostHours * penaltyMultiplier();
  return {
    hourlyRate,
    deduction,
    rewardAmount,
    punishmentAmount,
    netSalary: Math.max(
      0,
      baseSalary + rewardAmount - deduction - punishmentAmount,
    ),
  };
};

const localDateKey = (value: string) => {
  // Match the Events page and report's Baghdad (UTC+03:00) month boundaries.
  const date = new Date(new Date(value).getTime() + 3 * 3600000);
  return date.toISOString().slice(0, 10);
};

export const deviceAttendanceRecords = (
  events: AttendanceEvent[],
  people: Person[],
  employees: HrRecord[],
  month: string,
) => {
  const employeeByPerson = new Map(
    people
      .filter((person) => person.employeeId)
      .map((person) => [person.id, person.employeeId!]),
  );
  const groups = new Map<
    string,
    { employeeId: string; date: string; events: AttendanceEvent[] }
  >();
  const employeeById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );
  for (const event of events) {
    const employeeId =
      event.person?.employeeId ??
      (event.person?.id ? employeeByPerson.get(event.person.id) : undefined);
    const date = localDateKey(event.occurredAt);
    if (!employeeId || !date.startsWith(month)) continue;
    const key = `${employeeId}:${date}`;
    const group = groups.get(key) ?? { employeeId, date, events: [] };
    group.events.push(event);
    groups.set(key, group);
  }
  return [...groups.values()].map(({ employeeId, date, events: records }) => {
    const ordered = records.sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
    const checkIn = ordered.find(
      (event) => event.eventType === "check_in",
    )?.occurredAt;
    const checkOut = ordered
      .filter((event) => event.eventType === "check_out")
      .at(-1)?.occurredAt;
    let workedMinutes =
      checkIn && checkOut
        ? Math.max(
            0,
            Math.round(
              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                60000,
            ),
          )
        : 0;
    const employee = employeeById.get(employeeId);
    if (employee?.scheduleType === "dynamic") {
      let opened: number | null = null;
      let elapsed = 0;
      for (const event of ordered) {
        const at = new Date(event.occurredAt).getTime();
        if (event.eventType === "check_in" && opened === null) opened = at;
        if (event.eventType === "check_out" && opened !== null) {
          elapsed += Math.max(0, at - opened);
          opened = null;
        }
      }
      workedMinutes = Math.round(elapsed / 60000);
    }
    const [recordYear, recordMonth, recordDay] = date.split("-").map(Number);
    const daySchedule = scheduleForDay(
      employee ?? ({ id: employeeId } as HrRecord),
      new Date(recordYear, recordMonth - 1, recordDay).getDay(),
    );
    const expectedMinutes = daySchedule ? scheduledMinutes(daySchedule) : 0;
    const expectedAt = (value: unknown) => {
      const [hour, minute] = String(value).split(":").map(Number);
      return (
        Date.UTC(recordYear, recordMonth - 1, recordDay, hour, minute) -
        3 * 3600000
      );
    };
    const expectedCheckIn = expectedAt(daySchedule?.checkInTime ?? "09:00");
    let expectedCheckOut = expectedAt(daySchedule?.checkOutTime ?? "17:00");
    if (expectedCheckOut <= expectedCheckIn) expectedCheckOut += 86400000;
    const flexible = employee?.scheduleType === "dynamic";
    const lateMinutes =
      !daySchedule || flexible
        ? 0
        : checkIn
          ? Math.max(
              0,
              Math.round(
                (new Date(checkIn).getTime() - expectedCheckIn) / 60000,
              ) - (settingsSnapshot()?.hr.graceMinutes ?? 0),
            )
          : expectedMinutes;
    const earlyLeaveMinutes = flexible
      ? 0
      : !daySchedule
        ? 0
        : checkOut
          ? Math.max(
              0,
              Math.round(
                (expectedCheckOut - new Date(checkOut).getTime()) / 60000,
              ),
            )
          : expectedMinutes;
    return {
      id: `device:${employeeId}:${date}`,
      employeeId,
      attendanceDate: date,
      checkIn: checkIn ?? null,
      checkOut: checkOut ?? null,
      workedMinutes,
      expectedMinutes,
      hasWorkSchedule: Array.isArray(employee?.workSchedule),
      isWorkingDay: !!daySchedule,
      lateMinutes,
      earlyLeaveMinutes,
      flexibleSchedule: flexible,
      missingMinutes:
        flexible && checkIn && checkOut
          ? Math.max(0, expectedMinutes - workedMinutes)
          : 0,
      status: "present",
      source: "device",
    } satisfies HrRecord;
  });
};
