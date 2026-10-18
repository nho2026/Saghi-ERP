import { useCallback } from "react";
import {
  Activity,
  ArrowUpRight,
  Baby,
  Banknote,
  CalendarDays,
  HeartPulse,
  MoreHorizontal,
  Stethoscope,
  Syringe,
  UsersRound,
  WalletCards,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { hrApi } from "@/features/hr/api/hr.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { feedbackApi } from "@/features/feedback/api/feedback.api";

const visits = [
  { month: "Jan", dental: 112, children: 78, heart: 43 },
  { month: "Feb", dental: 138, children: 92, heart: 56 },
  { month: "Mar", dental: 126, children: 110, heart: 48 },
  { month: "Apr", dental: 164, children: 118, heart: 71 },
  { month: "May", dental: 151, children: 130, heart: 64 },
  { month: "Jun", dental: 182, children: 142, heart: 79 },
];
const admissions = [42, 68, 54, 83, 71, 96, 88];
const revenue = [18, 26, 23, 36, 32, 44, 48, 43, 55, 51, 62, 68];
const divisions = [
  {
    name: "Dental",
    value: 1240,
    percent: 86,
    icon: Stethoscope,
    color: "#00664f",
  },
  { name: "Pediatrics", value: 987, percent: 69, icon: Baby, color: "#36ad89" },
  {
    name: "Cardiology",
    value: 642,
    percent: 45,
    icon: HeartPulse,
    color: "#71bd9f",
  },
  {
    name: "General care",
    value: 524,
    percent: 37,
    icon: Activity,
    color: "#008260",
  },
];
const appointments = [
  ["09:00", "General consultation", "Dr. Ahmed Salim", "bg-violet-500"],
  ["10:30", "Dental examination", "Dr. Sara Karim", "bg-teal-500"],
  ["12:00", "Pediatric follow-up", "Dr. Lana Omar", "bg-emerald-500"],
  ["14:15", "Cardiology review", "Dr. Kamal Ali", "bg-rose-500"],
];

function Legend() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center gap-4 text-[11px] text-muted-foreground">
      {[
        ["Dental", "#00664f"],
        ["Pediatrics", "#36ad89"],
        ["Cardiology", "#a4d7c3"],
      ].map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <i className="size-2 rounded-full" style={{ background: color }} />
          {t(`dashboardLocal.departments.${label.toLowerCase()}`)}
        </span>
      ))}
    </div>
  );
}

function VisitChart() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="relative flex h-64 items-end gap-4 px-2 pt-5">
          {[50, 100, 150, 200].map((value) => (
            <div
              key={value}
              className="absolute inset-x-0 border-t border-dashed border-border/70"
              style={{ bottom: `${(value / 200) * 88}%` }}
            >
              <span className="absolute -top-2.5 inset-s-0 bg-card pe-2 text-[9px] text-muted-foreground">
                {value}
              </span>
            </div>
          ))}
          {visits.map((item) => (
            <div
              key={item.month}
              className="relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="flex h-[88%] items-end gap-1.5">
                {(
                  [
                    ["dental", "#00664f"],
                    ["children", "#36ad89"],
                    ["heart", "#a4d7c3"],
                  ] as const
                ).map(([key, color]) => (
                  <span
                    key={key}
                    className="w-3.5 rounded-full transition-opacity hover:opacity-70"
                    title={`${key}: ${item[key]}`}
                    style={{ height: `${item[key] / 2}%`, background: color }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {item.month}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Legend />
        </div>
      </div>
    </div>
  );
}

function RevenueChart() {
  const points = revenue
    .map((v, i) => `${24 + i * 48},${176 - v * 2.05}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 576 200"
      className="h-52 w-full overflow-visible"
      role="img"
      aria-label="Annual revenue"
    >
      <defs>
        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#008260" stopOpacity=".35" />
          <stop offset="100%" stopColor="#008260" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[36, 82, 128, 176].map((y, i) => (
        <g key={y}>
          <line
            x1="24"
            y1={y}
            x2="552"
            y2={y}
            stroke="currentColor"
            opacity=".09"
            strokeDasharray="4 5"
          />
          <text x="0" y={y + 3} fill="currentColor" opacity=".45" fontSize="9">
            ${[70, 50, 30, 10][i]}k
          </text>
        </g>
      ))}
      <polygon points={`${points} 552,176 24,176`} fill="url(#rev)" />
      <polyline
        points={points}
        fill="none"
        stroke="#008260"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {revenue.map((v, i) => (
        <circle
          key={i}
          cx={24 + i * 48}
          cy={176 - v * 2.05}
          r="3.5"
          fill="white"
          stroke="#008260"
          strokeWidth="2"
        />
      ))}
      {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m, i) => (
        <text
          key={m}
          x={24 + i * 96}
          y="198"
          fill="currentColor"
          opacity=".5"
          fontSize="10"
          textAnchor="middle"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

function AdmissionChart() {
  const max = Math.max(...admissions);
  return (
    <div className="mt-4 flex h-20 items-end gap-2">
      {admissions.map((v, i) => (
        <div
          key={i}
          className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
        >
          <span
            className="w-full rounded-full bg-primary/25 transition-colors hover:bg-primary"
            style={{ height: `${(v / max) * 100}%` }}
            title={`${v} admissions`}
          />
          <small className="text-[9px] text-muted-foreground">
            {["S", "S", "M", "T", "W", "T", "F"][i]}
          </small>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation(),
    loader = useCallback(() => hrApi.employees.list(), []),
    employees = useApiResource(loader),
    salaryLoader = useCallback(() => hrApi.salaries.list(), []),
    salaries = useApiResource(salaryLoader),
    feedbackLoader = useCallback(() => feedbackApi.summary(), []),
    feedback = useApiResource(feedbackLoader),
    employeeCount = employees.data?.length,
    salaryBudget = 6000;
  const stats = [
    {
      label: t("health.totalSurgery", { defaultValue: "Total surgeries" }),
      value: "486",
      change: "12.5%",
      up: true,
      icon: Syringe,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-950",
    },
    {
      label: t("health.totalBeneficiaries", { defaultValue: "Total patients" }),
      value: "3,256",
      change: "8.2%",
      up: true,
      icon: UsersRound,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-950",
    },
    {
      label: t("health.totalIncome", { defaultValue: "Total revenue" }),
      value: "$42,580",
      change: "15.3%",
      up: true,
      icon: Banknote,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950",
    },
    {
      label: t("health.totalEmployees", { defaultValue: "Medical staff" }),
      value: employeeCount?.toLocaleString() ?? "—",
      change: "2.1%",
      up: false,
      icon: Stethoscope,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-950",
    },
    {
      label: t("dashboardLocal.employeeBudget"),
      value: "$" + salaryBudget?.toLocaleString(),
      change: t("dashboardLocal.budgetAllocated"),
      up: true,
      icon: WalletCards,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-950",
    },
  ];
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 rounded-2xl bg-muted/30 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-primary">
            {t("dashboardLocal.analytics")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("health.title", { defaultValue: "Healthcare overview" })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboardLocal.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-card px-4 py-2 text-xs">
          <CalendarDays className="size-4 text-primary" />
          <span className="font-medium">Jan 1 — Jun 30, 2026</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, change, icon: Icon }, i) => (
          <Card
            key={label}
            className={`overflow-hidden rounded-2xl border-0 shadow-none ${i === 0 ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : "bg-card"}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{label}</p>
                <ArrowUpRight
                  aria-hidden="true"
                  className={`size-7 shrink-0 rounded-full border p-1 ${i === 0 ? "border-white/30" : "border-border"}`}
                />
              </div>
              <div className="my-5">
                {(i === 3 && employees.isLoading) ||
                (i === 4 && salaries.isLoading) ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <strong className="text-4xl font-medium tracking-tight">
                    {value}
                  </strong>
                )}
              </div>
              <p
                className={`flex items-center gap-2 text-xs ${i === 0 ? "text-emerald-100" : "text-muted-foreground"}`}
              >
                <Icon className="size-3.5" />
                {change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="rounded-2xl border-0 shadow-none xl:col-span-7">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {t("dashboardLocal.patientVisits")}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dashboardLocal.monthlyVisits")}
              </p>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <VisitChart />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-none xl:col-span-5">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {t("dashboardLocal.revenuePerformance")}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dashboardLocal.revenueYear")}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950">
              +18.4%
            </span>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Card className="rounded-2xl border-0 shadow-none xl:col-span-5">
          <CardHeader>
            <CardTitle className="text-base">
              {t("dashboardLocal.departmentDistribution")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("dashboardLocal.patientsMonth")}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {divisions.map(({ name, value, percent, icon: Icon, color }) => (
              <div key={name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-medium">
                    <Icon className="size-3.5" style={{ color }} />
                    {t(
                      `dashboardLocal.departments.${name.toLowerCase().replace(" ", "")}`,
                    )}
                  </span>
                  <span className="text-xs font-bold">
                    {value.toLocaleString()}{" "}
                    <small className="font-normal text-muted-foreground">
                      ({percent}%)
                    </small>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-none xl:col-span-7">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">
                {t("dashboardLocal.todayAppointments")}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                24 scheduled · 4 coming next
              </p>
            </div>
            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
              {t("dashboardLocal.viewCalendar")}
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            {appointments.map(([time, name, doctor, color]) => (
              <div
                key={time}
                className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/60"
              >
                <span className="w-10 text-[11px] font-bold text-muted-foreground">
                  {time}
                </span>
                <i className={`h-8 w-1 rounded-full ${color}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {doctor}
                  </p>
                </div>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-none">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">
                {t("dashboardLocal.weeklyAdmissions")}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dashboardLocal.admissionsSummary")}
              </p>
            </div>
            <strong className="text-xl">+11.4%</strong>
          </CardHeader>
          <CardContent>
            <AdmissionChart />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-linear-to-br from-[#003c30] to-[#008260] text-white shadow-none">
          <CardContent className="flex h-full min-h-44 flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-white/15 p-2.5">
                <HeartPulse className="size-5" />
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px]">
                {t("dashboardLocal.liveInsights")}
              </span>
            </div>
            <div>
              <p className="text-sm text-white/70">
                {t("feedback.dashboardRating")}
              </p>
              <div className="mt-1 flex items-end gap-3">
                <strong className="text-4xl">
                  {feedback.data?.average?.toFixed(1) ?? "0.0"}/5
                </strong>
                <span className="mb-1 flex items-center gap-1 text-xs text-amber-200">
                  <Star className="size-4 fill-current" />
                  {t("feedback.reviewCount", {
                    count: feedback.data?.count ?? 0,
                  })}
                </span>
                <span className="hidden">↑ 3.2% this month</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${((feedback.data?.average ?? 0) / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {employees.error && (
        <p className="text-xs text-muted-foreground">
          Employee service is unavailable; showing the latest dashboard
          snapshot.
        </p>
      )}
    </div>
  );
}
