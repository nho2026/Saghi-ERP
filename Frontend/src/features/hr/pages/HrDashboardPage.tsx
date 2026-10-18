import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  UsersRound,
  Search,
  CalendarDays,
  Building2,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { hrApi, type HrRecord } from "../api/hr.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

const relationName = (value: unknown) =>
  value && typeof value === "object" && "name" in value
    ? String(value.name)
    : "—";
const name = (employee: HrRecord) =>
  `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
export default function HrDashboardPage() {
  const { t } = useTranslation();
  const user = storedUser();
  const [search, setSearch] = useState("");
  const resource = useApiResource(
    useCallback(() => hrApi.employees.list(), []),
  );
  const employees = resource.data ?? [];
  const active = employees.filter((e) => e.status === "active").length;
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const joined = employees.filter((e) =>
    String(e.hireDate ?? "").startsWith(month),
  ).length;
  const departments = new Map<string, number>();
  for (const employee of employees)
    if (employee.department) {
      const department = relationName(employee.department);
      departments.set(department, (departments.get(department) ?? 0) + 1);
    }
  const distribution = [...departments.entries()].sort((a, b) => b[1] - a[1]);
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: date.toLocaleDateString(undefined, { month: "short" }),
      count: employees.filter((e) => String(e.hireDate ?? "").startsWith(key))
        .length,
    };
  });
  const max = Math.max(1, ...months.map((m) => m.count));
  const percentage = employees.length
    ? Math.round((active / employees.length) * 100)
    : 0;
  const recent = [...employees]
    .filter((e) =>
      `${name(e)} ${relationName(e.department)} ${e.employeeCode ?? ""}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) =>
      String(b.hireDate ?? "").localeCompare(String(a.hireDate ?? "")),
    )
    .slice(0, 6);
  const links = [
    {
      to: "/employees",
      label: t("navigation.employees"),
      permission: "hr.employees.view",
    },
    {
      to: "/hr-attendance",
      label: t("navigation.hrAttendance"),
      permission: "hr.attendance.view",
    },
    {
      to: "/payrolls",
      label: t("navigation.payrolls"),
      permission: "hr.payrolls.view",
    },
    {
      to: "/salaries",
      label: t("navigation.salaries"),
      permission: "hr.salaries.view",
    },
    {
      to: "/positions",
      label: t("navigation.positions"),
      permission: "hr.positions.view",
    },
    {
      to: "/hr/reports",
      label: t("navigation.hrReports"),
      permission: "hr.reports.view",
    },
  ].filter((link) => hasPermission(user, link.permission));
  const value = (n: number) => (resource.isLoading || resource.error ? "—" : n);
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 rounded-2xl bg-muted/30 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute inset-s-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="rounded-full border-0 bg-muted/40 ps-9"
            placeholder="Search employees or departments"
            aria-label="Search employees or departments"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-2">
          <span className="me-2 size-2 rounded-full bg-primary" />
          HR workspace
        </Badge>
      </div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("navigation.hrDashboard")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your people, departments, and workforce at a glance.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/employees">
            <UsersRound className="size-4" />
            {t("navigation.employees")}
          </Link>
        </Button>
      </header>
      {resource.error && (
        <Card
          className="flex items-center justify-between gap-3 p-4"
          role="alert"
        >
          <p className="text-destructive">{resource.error}</p>
          <Button variant="outline" onClick={() => void resource.refresh()}>
            Retry
          </Button>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Employees",
            count: employees.length,
            note: "Your complete workforce",
          },
          {
            label: "Active Employees",
            count: active,
            note: "Currently active staff",
          },
          {
            label: "Departments",
            count: departments.size,
            note: "Departments with employees",
          },
          {
            label: "New This Month",
            count: joined,
            note: now.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            }),
          },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            className={`rounded-2xl border-0 p-5 shadow-none ${i === 0 ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">{stat.label}</h2>
              <ArrowUpRight
                className={`size-7 rounded-full border p-1 ${i === 0 ? "border-white/30" : "border-border"}`}
              />
            </div>
            <p className="my-5 text-4xl font-medium">{value(stat.count)}</p>
            <p
              className={`text-xs ${i === 0 ? "text-emerald-100" : "text-muted-foreground"}`}
            >
              {stat.note}
            </p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-9">
          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <h2 className="font-semibold">Hiring Activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Employee start dates · last six months
            </p>
            <div
              className="mt-6 flex h-40 items-end gap-4"
              role="img"
              aria-label={months
                .map((m) => `${m.label}: ${m.count}`)
                .join(", ")}
            >
              {months.map((m, i) => (
                <div
                  key={i}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {value(m.count)}
                  </span>
                  <div
                    className={`w-full max-w-12 rounded-full ${i === 5 ? "bg-primary" : "bg-primary/50"}`}
                    style={{
                      height: `${Math.max(4, (m.count / max) * 100)}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <h2 className="font-semibold">Workforce Status</h2>
            <div className="relative mx-auto mt-5 max-w-64">
              <svg
                viewBox="0 0 220 130"
                role="img"
                aria-label={`${percentage}% active employees`}
              >
                <path
                  d="M25 110 A85 85 0 0 1 195 110"
                  fill="none"
                  stroke="currentColor"
                  className="text-muted"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                <path
                  d="M25 110 A85 85 0 0 1 195 110"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="28"
                  pathLength="100"
                  strokeDasharray={`${percentage} 100`}
                  strokeLinecap={percentage ? "round" : "butt"}
                />
              </svg>
              <div className="absolute inset-x-0 bottom-2 text-center">
                <p className="text-4xl font-semibold">
                  {resource.isLoading || resource.error
                    ? "—"
                    : `${percentage}%`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active employees
                </p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {value(active)} active · {value(employees.length - active)} other
              statuses
            </p>
          </Card>
          <Card className="rounded-2xl border-0 p-5 shadow-none md:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">
                {search ? "Employee Search" : "Recently Joined"}
              </h2>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <Link to="/employees">
                  View all
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {recent.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 rounded-xl bg-muted/25 p-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {name(employee)
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {name(employee)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {relationName(employee.department)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {employee.hireDate
                        ? new Date(
                            String(employee.hireDate),
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {String(employee.status ?? "—")}
                  </Badge>
                </div>
              ))}
            </div>
            {!recent.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {resource.isLoading
                  ? "Loading employees…"
                  : resource.error
                    ? "Employee data unavailable"
                    : "No matching employees"}
              </p>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-4 xl:col-span-3">
          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <h2 className="mb-5 flex items-center gap-2 font-semibold">
              <Building2 className="size-4 text-primary" />
              Departments
            </h2>
            <div className="max-h-72 space-y-4 overflow-y-auto">
              {distribution.map(([label, count]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between gap-2 text-xs">
                    <span>{label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(count / Math.max(1, employees.length)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {!distribution.length && (
                <p className="text-sm text-muted-foreground">
                  {resource.isLoading
                    ? "Loading departments…"
                    : "No department data"}
                </p>
              )}
            </div>
          </Card>
          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <BriefcaseBusiness className="size-4 text-primary" />
              HR Tools
            </h2>
            {links.map((link) => (
              <Button
                key={link.to}
                asChild
                variant="ghost"
                className="w-full justify-between"
              >
                <Link to={link.to}>
                  {link.label}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            ))}
          </Card>
          <Card className="rounded-2xl border-0 bg-linear-to-br from-[#003c30] to-[#008260] p-5 text-white shadow-none">
            <CalendarDays className="mb-4 size-6" />
            <p className="text-2xl font-medium">
              {now.toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="mt-2 text-xs text-emerald-100">
              {now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
              })}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
