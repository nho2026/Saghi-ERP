import { useServerTable } from "@/shared/hooks/useServerTable";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type TaskReport } from "../api/tasks.api";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
const hours = (minutes: number) =>
  (minutes / 60).toLocaleString(undefined, { maximumFractionDigits: 1 });
export default function TaskReportsPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const employees = useServerTable<
    TaskReport["employees"][number],
    { summary: TaskReport["summary"] }
  >("/tasks/reports/monthly", { month, section: "employees" });
  const report = employees.pageData
    ? { summary: employees.pageData.summary, employees: employees.data ?? [] }
    : null;
  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("tasks.report.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("tasks.report.subtitle")}
          </p>
        </div>
        <label className="grid min-w-52 gap-1 text-sm">
          {t("tasks.report.month")}
          <FormDatePicker mode="month" value={month} onValueChange={setMonth} />
        </label>
      </header>
      {employees.error && (
        <p role="alert" className="text-destructive">
          {employees.error}
        </p>
      )}
      {report && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ["created", report.summary.created],
              ["completed", report.summary.completed],
              ["overdue", report.summary.overdue],
              ["completionRate", `${report.summary.completionRate}%`],
              ["estimatedHours", hours(report.summary.estimatedMinutes)],
              ["trackedHours", hours(report.summary.trackedMinutes)],
            ].map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs text-muted-foreground">
                    {t(`tasks.report.${key}`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {value}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-xl border bg-card">
              <h2 className="border-b p-4 font-semibold">
                {t("tasks.report.employeePerformance")}
              </h2>
              <div className="overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="border-b text-start">
                      <TableHead className="p-3 text-start">
                        {t("navigation.employees")}
                      </TableHead>
                      <TableHead className="p-3 text-start">
                        {t("tasks.report.hours")}
                      </TableHead>
                      <TableHead className="p-3 text-start">
                        {t("tasks.report.entries")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody {...employees.tableProps}>
                    {report.employees.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {t("tasks.report.noData")}
                        </TableCell>
                      </TableRow>
                    )}
                    {report.employees.map((x) => (
                      <TableRow
                        key={x.employeeId}
                        className="border-b last:border-0"
                      >
                        <TableCell className="p-3">{x.employeeName}</TableCell>
                        <TableCell className="p-3">
                          {hours(x.minutes)}
                        </TableCell>
                        <TableCell className="p-3">{x.entries}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
