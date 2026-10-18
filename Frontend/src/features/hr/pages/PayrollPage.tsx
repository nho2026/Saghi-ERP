import { useFullReportPrint } from "@/shared/hooks/useFullReportPrint";
import { apiClient } from "@/shared/api/client";
import { useServerTable } from "@/shared/hooks/useServerTable";
import type { HrRecord } from "../api/hr.api";
import { useState } from "react";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { MonthPicker } from "@/shared/components/ui/month-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { duration, employeeLabel, monthValue } from "./monthly-hr";

export default function PayrollPage() {
  const { t, i18n } = useTranslation();
  const tx = (key: string, fallback: string) =>
    t(`hrMonthly.${key}`, { defaultValue: fallback });
  const [month, setMonth] = useState(monthValue());
  const table = useServerTable<{
    employee: HrRecord;
    salary: HrRecord;
    minutesLost: number;
    hourlyRate: number;
    adjustments: HrRecord[];
    deduction: number;
    advanceDeduction: number;
    netSalary: number;
    rewardAmount: number;
    punishmentAmount: number;
  }>("/employees/records/payrolls/monthly-report", { month });
  const fullPrint = useFullReportPrint(() =>
    apiClient
      .get<NonNullable<typeof table.data>>(
        "/employees/records/payrolls/monthly-report",
        { params: { month, export: "true" } },
      )
      .then((r) => r.data),
  );
  const rows = fullPrint.printData ?? table.data ?? [];
  const money = (value: number, currency?: unknown) =>
    `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${String(currency ?? "")}`.trim();
  const loadError = table.error,
    isLoading = table.isLoading;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {tx("payrollTitle", "Monthly payroll")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx(
              "payrollSubtitle",
              "All employees, with salary automatically adjusted from monthly attendance.",
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <MonthPicker
            value={month}
            onValueChange={setMonth}
            locale={i18n.resolvedLanguage}
            label={tx("attendanceMonth", "Attendance month")}
            className="flex-1 sm:flex-none"
          />
          <Button
            permission="print"
            type="button"
            variant="outline"
            className="h-11 gap-2 px-4"
            disabled={isLoading || Boolean(loadError) || fullPrint.printing}
            onClick={() => void fullPrint.print()}
          >
            <Printer className="size-4" />
            {tx("print", "Print")}
          </Button>
        </div>
      </div>
      {loadError && <p className="text-sm text-destructive">{loadError}</p>}
      <Card className="print-document print-document-visible salary-list-print">
        <CardContent className="p-0">
          <Table className="w-max min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 whitespace-nowrap">#</TableHead>
                  <TableHead className="min-w-36">{t("hr.employee")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("hr.baseSalary")}</TableHead>
                  <TableHead className="whitespace-nowrap">{tx("lostHours", "Lost hours")}</TableHead>
                  <TableHead className="whitespace-nowrap">{tx("hourlyRate", "Hourly rate")}</TableHead>
                  <TableHead className="whitespace-nowrap">
                    {tx("attendanceDeduction", "Attendance deduction")}
                  </TableHead>
                  <TableHead className="whitespace-nowrap">{tx("rewards", "Rewards")}</TableHead>
                  <TableHead className="whitespace-nowrap">{tx("punishments", "Punishments")}</TableHead>
                  <TableHead className="whitespace-nowrap">{tx("advanceDeduction", "Advance deduction")}</TableHead>
                  <TableHead className="min-w-56">{tx("adjustmentReasons", "Reasons")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("hr.net")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                autoPaginate={false}
                pagination={fullPrint.printData ? undefined : table.pagination}
              >
                <TableResourceState
                  isLoading={isLoading}
                  error={loadError ?? null}
                  isEmpty={!rows.length}
                  colSpan={11}
                />
                {!isLoading &&
                  !loadError &&
                  rows.map((row, index) => (
                    <TableRow key={row.employee.id}>
                      <TableCell className="whitespace-nowrap">{index + 1}</TableCell>
                      <TableCell className="min-w-36 max-w-52">
                        <p className="font-medium">
                          {employeeLabel(row.employee)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {String(row.employee.employeeCode)}
                        </p>
                      </TableCell>
                      {row.salary ? (
                        <>
                          <TableCell className="whitespace-nowrap">
                            {money(
                              Number(row.salary.baseSalary),
                              row.salary.currencyId,
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{duration(row.minutesLost)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {money(row.hourlyRate, row.salary.currencyId)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-destructive">
                            − {money(row.deduction, row.salary.currencyId)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-emerald-700">
                            + {money(row.rewardAmount, row.salary.currencyId)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-destructive">
                            −{" "}
                            {money(row.punishmentAmount, row.salary.currencyId)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-destructive">
                            − {money(row.advanceDeduction, row.salary.currencyId)}
                          </TableCell>
                          <TableCell className="min-w-56">
                            {row.adjustments.length ? (
                              <ul className="space-y-1 text-xs">
                                {row.adjustments.map((adjustment) => (
                                  <li key={adjustment.id}>
                                    <span
                                      className={
                                        adjustment.type === "reward"
                                          ? "font-semibold text-emerald-700"
                                          : "font-semibold text-destructive"
                                      }
                                    >
                                      {adjustment.type === "reward" ? "+" : "−"}
                                      {money(
                                        Number(adjustment.amount),
                                        row.salary?.currencyId,
                                      )}
                                    </span>{" "}
                                    — {String(adjustment.reason)}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-bold text-emerald-700">
                            {money(row.netSalary, row.salary.currencyId)}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell
                          colSpan={8}
                          className="text-muted-foreground"
                        >
                          {tx("noSalary", "No active salary for this month")}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
