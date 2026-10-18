import { useCallback, useMemo } from "react";
import {
  Banknote,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { hrApi, type HrRecord } from "../api/hr.api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useApiResource } from "@/shared/hooks/useApiResource";

const text = (value: unknown) => String(value ?? "");
const nestedName = (record: HrRecord, key: string, fallback: string) =>
  text((record[key] as HrRecord | null)?.name) || fallback;

function Bars({
  data,
  color = "bg-primary",
}: {
  data: [string, number][];
  color?: string;
}) {
  const total = Math.max(
    1,
    data.reduce((sum, [, value]) => sum + value, 0),
  );
  if (!data.length)
    return <p className="py-16 text-center text-sm text-muted-foreground">—</p>;
  return (
    <div className="space-y-4">
      {data.map(([label, value]) => (
        <div key={label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium">{label}</span>
            <strong>{((value / total) * 100).toFixed(1)}%</strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${(value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const chartColors = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#6366f1",
  "#84cc16",
];

function DonutChart({ data }: { data: [string, number][] }) {
  const total = data.reduce((sum, [, value]) => sum + value, 0);
  if (!total)
    return <p className="py-16 text-center text-sm text-muted-foreground">—</p>;
  let offset = 0;
  const segments = data.map(([label, value], index) => {
    const percent = (value / total) * 100;
    const segment = {
      label,
      value,
      percent,
      offset,
      color: chartColors[index % chartColors.length],
    };
    offset += percent;
    return segment;
  });
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto size-44">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img">
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            className="text-muted"
          />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={segment.color}
              strokeWidth="14"
              pathLength="100"
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={-segment.offset}
              className="transition-opacity hover:opacity-75"
            >
              <title>{`${segment.label}: ${segment.percent.toFixed(1)}% (${segment.value})`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <strong className="text-2xl">100%</strong>
          <span className="text-[10px] text-muted-foreground">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="space-y-2.5">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-xs">
            <i
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="min-w-0 flex-1 truncate">{segment.label}</span>
            <strong>{segment.percent.toFixed(1)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyPayroll({ payrolls }: { payrolls: HrRecord[] }) {
  const months = useMemo(() => {
    const values = new Map<string, number>();
    payrolls.forEach((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, "0")}`;
      values.set(key, (values.get(key) ?? 0) + Number(item.netSalary ?? 0));
    });
    return [...values.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);
  }, [payrolls]);
  const max = Math.max(1, ...months.map(([, value]) => value));
  return (
    <div className="overflow-x-auto">
      <div className="flex h-64 min-w-[520px] items-end gap-3 border-b px-2 pt-5">
        {months.map(([month, value]) => (
          <div
            key={month}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[10px] font-semibold">
              {((value / max) * 100).toFixed(0)}%
            </span>
            <div
              title={`${month}: ${value.toLocaleString()}`}
              className="w-full rounded-t-md bg-linear-to-t from-emerald-600 to-teal-400 shadow-sm hover:opacity-80"
              style={{ height: `${Math.max(3, (value / max) * 82)}%` }}
            />
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">
              {month}
            </span>
          </div>
        ))}
        {!months.length && (
          <p className="m-auto text-sm text-muted-foreground">—</p>
        )}
      </div>
    </div>
  );
}

export default function HrReportsPage() {
  const { t } = useTranslation();
  const employees = useApiResource(
    useCallback(() => hrApi.employees.list(), []),
  );
  const positions = useApiResource(
    useCallback(() => hrApi.positions.list(), []),
  );
  const attendance = useApiResource(
    useCallback(() => hrApi.attendance.list(), []),
  );
  const payrolls = useApiResource(useCallback(() => hrApi.payrolls.list(), []));
  const loading =
    employees.isLoading ||
    positions.isLoading ||
    attendance.isLoading ||
    payrolls.isLoading;
  const employeeRows = employees.data ?? [];
  const attendanceRows = attendance.data ?? [];
  const payrollRows = payrolls.data ?? [];
  const group = (rows: HrRecord[], label: (row: HrRecord) => string) => {
    const values = new Map<string, number>();
    rows.forEach((row) => {
      const key = label(row);
      values.set(key, (values.get(key) ?? 0) + 1);
    });
    return [...values.entries()].sort((a, b) => b[1] - a[1]);
  };
  const departments = group(employeeRows, (row) =>
    nestedName(row, "department", t("hrReports.unassigned")),
  );
  const positionData = group(employeeRows, (row) =>
    nestedName(row, "position", t("hrReports.unassigned")),
  );
  const attendanceData = group(
    attendanceRows,
    (row) => text(row.status) || t("hrReports.unknown"),
  );
  const active = employeeRows.filter((row) => row.status === "active").length;
  const activePercent = employeeRows.length
    ? (active / employeeRows.length) * 100
    : 0;
  const payrollTotal = payrollRows.reduce(
    (sum, row) => sum + Number(row.netSalary ?? 0),
    0,
  );
  const cards = [
    [
      t("hrReports.totalEmployees"),
      employeeRows.length,
      UsersRound,
      "bg-teal-100 text-teal-600 dark:bg-teal-950",
    ],
    [
      t("hrReports.activeEmployees"),
      `${active} · ${activePercent.toFixed(1)}%`,
      UserCheck,
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950",
    ],
    [
      t("hrReports.positions"),
      positions.data?.length ?? 0,
      BriefcaseBusiness,
      "bg-violet-100 text-violet-600 dark:bg-violet-950",
    ],
    [
      t("hrReports.totalPayroll"),
      payrollTotal.toLocaleString(),
      Banknote,
      "bg-amber-100 text-amber-600 dark:bg-amber-950",
    ],
  ] as const;
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-primary">
          {t("hrReports.analytics")}
        </p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <ChartNoAxesCombined className="size-7 text-primary" />
          {t("hrReports.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("hrReports.description")}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <Card key={label} className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <span
                className={`mb-4 grid size-11 place-items-center rounded-xl ${color}`}
              >
                <Icon className="size-5" />
              </span>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <strong className="text-2xl">{value}</strong>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="border-border/60 shadow-sm xl:col-span-7">
          <CardHeader>
            <CardTitle className="text-base">
              {t("hrReports.monthlyPayroll")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("hrReports.monthlyPayrollDescription")}
            </p>
          </CardHeader>
          <CardContent>
            <MonthlyPayroll payrolls={payrollRows} />
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm xl:col-span-5">
          <CardHeader>
            <CardTitle className="text-base">
              {t("hrReports.departmentDistribution")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("hrReports.employeeDistribution")}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <DonutChart data={departments} />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {t("hrReports.attendanceOverview")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("hrReports.attendanceDescription")}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <DonutChart data={attendanceData} />
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {t("hrReports.positionDistribution")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("hrReports.employeeDistribution")}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Bars data={positionData} color="bg-violet-500" />
            )}
          </CardContent>
        </Card>
      </div>
      {[employees.error, positions.error, attendance.error, payrolls.error]
        .filter((error): error is string => Boolean(error))
        .map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}
    </div>
  );
}
