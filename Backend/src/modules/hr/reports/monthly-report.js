import { prisma } from "../../../shared/database/client.js";
import { paginateRows } from "../../../shared/database/paginate.js";
import { employeeModel } from "../employees/employees.model.js";
import { getSettings } from "../../settings/settings.service.js";
import { monthlyCalculations } from "./monthly-calculations.js";

export async function monthlyReport(query, payroll = false) {
  const month = String(query.month ?? "");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw Object.assign(new Error("Select a valid month."), { status: 400 });
  const [year, monthNumber] = month.split("-").map(Number);
  const from = new Date(`${month}-01T00:00:00+03:00`),
    to = new Date(Date.UTC(year, monthNumber, 1) - 3 * 3600000);
  const [
    employeesRaw,
    eventsRaw,
    permissionsRaw,
    hr,
    salariesRaw,
    adjustmentsRaw,
    advancesRaw,
  ] = await Promise.all([
    employeeModel.findAll(),
    prisma.attendanceEvent.findMany({
      where: { occurredAt: { gte: from, lt: to } },
      include: {
        person: { select: { id: true, employeeId: true } },
        device: { select: { name: true } },
      },
      orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
    }),
    prisma.attendancePermission.findMany({
      where: { fromDate: { lt: to }, toDate: { gte: from } },
    }),
    getSettings("hr"),
    payroll
      ? prisma.employeeSalary.findMany({
          where: {
            effectiveFrom: { lt: to },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: from } }],
          },
        })
      : [],
    payroll
      ? prisma.payrollAdjustment.findMany({
          where: { year, month: monthNumber },
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        })
      : [],
    payroll
      ? prisma.salaryAdvance.findMany()
      : [],
  ]);
  // Match the dates/decimals supplied to the existing browser calculations.
  const [employees, events, permissions, salaries, adjustments, advances] =
    JSON.parse(
      JSON.stringify([
      employeesRaw,
      eventsRaw,
      permissionsRaw,
      salariesRaw,
      adjustmentsRaw,
      advancesRaw,
      ]),
    );
  const calc = monthlyCalculations({ hr });
  const records = calc.deviceAttendanceRecords(events, [], employees, month);
  if (payroll) {
    const rows = employees
      .filter((employee) => calc.activeSalaryFor(employee.id, salaries, month))
      .map((employee) => {
        const salary = calc.activeSalaryFor(employee.id, salaries, month);
        const minutesLost = records
          .filter((record) => record.employeeId === employee.id)
          .reduce(
            (sum, record) => sum + calc.lostMinutes(record, permissions),
            0,
          );
        const own = adjustments.filter((row) => row.employeeId === employee.id);
        const reward = own
          .filter((row) => row.type === "reward")
          .reduce((sum, row) => sum + Number(row.amount), 0);
        const punishment = own
          .filter((row) => row.type === "punishment")
          .reduce((sum, row) => sum + Number(row.amount), 0);
        const monthStart = `${month}-01`;
        const advanceDeductions = advances
          .filter((advance) => {
            const start = String(
              advance.deductionStartDate ??
                advance.approvedAt ??
                advance.requestedAt,
            ).slice(0, 7);
            const status = String(advance.status ?? "").toLowerCase();
            return (
              advance.employeeId === employee.id &&
              ["approved", "active"].includes(status) &&
              String(advance.currency ?? "").toUpperCase() ===
                String(salary.currencyId ?? "").toUpperCase() &&
              start <= month
            );
          })
          .map((advance) => {
            const startDate = new Date(
              `${String(
                advance.deductionStartDate ??
                  advance.approvedAt ??
                  advance.requestedAt,
              ).slice(0, 7)}-01T00:00:00Z`,
            );
            const payrollDate = new Date(`${monthStart}T00:00:00Z`);
            const elapsedMonths =
              (payrollDate.getUTCFullYear() - startDate.getUTCFullYear()) *
                12 +
              payrollDate.getUTCMonth() -
              startDate.getUTCMonth();
            if (elapsedMonths < 0) return null;
            const installment = Number((Number(advance.amount) / advance.installments).toFixed(2));
            // If earlier payroll periods were not processed, carry the unpaid
            // balance into the current report instead of making it disappear
            // after the planned installment window has ended.
            const due = elapsedMonths >= advance.installments - 1
              ? Number(advance.amount) - installment * (advance.installments - 1)
              : installment;
            // remainingAmount already reflects any installments recorded on the
            // advance, so do not subtract earlier scheduled months from it again.
            const remaining = Math.max(0, Number(advance.remainingAmount));
            return remaining > 0 ? Math.min(due, remaining) : 0;
          })
          .filter((amount) => amount !== null)
          .reduce((sum, amount) => sum + amount, 0);
        const monthlyScheduledHours =
          calc.monthlyScheduledMinutes(employee, month) / 60;
        const payrollAmounts = calc.payrollAmounts(
          Number(salary.baseSalary),
          minutesLost,
          monthlyScheduledHours,
          reward,
          punishment,
        );
        return {
          employee,
          salary,
          minutesLost,
          monthlyScheduledHours,
          adjustments: own,
          advanceDeduction: advanceDeductions,
          ...payrollAmounts,
          netSalary: Math.max(0, payrollAmounts.netSalary - advanceDeductions),
        };
      });
    if (query.export === "true") return rows;
    return paginateRows(rows, query);
  }
  const search = String(query.search ?? "")
    .trim()
    .toLowerCase();
  const filtered = employees.filter((employee) => {
    if (!(
      calc.employeeLabel(employee).toLowerCase().includes(search) ||
      String(employee.employeeCode).toLowerCase().includes(search)
    ))
      return false;
    if (
      query.departmentId === "none"
        ? Boolean(employee.departmentId)
        : query.departmentId &&
          query.departmentId !== "all" &&
          employee.departmentId !== query.departmentId
    )
      return false;
    const own = records.filter((row) => row.employeeId === employee.id);
    switch (query.attendance) {
      case "recorded":
        return own.length > 0;
      case "noRecords":
        return own.length === 0;
      case "late":
        return own.some((row) => Number(row.lateMinutes ?? 0) > 0);
      case "missingCheckout":
        return own.some((row) => row.checkIn && !row.checkOut);
      default:
        return true;
    }
  });
  const result = paginateRows(filtered, query);
  const ids = new Set([...result.items.map((row) => row.id), query.selectedId]);
  return {
    ...result,
    records: records.filter((row) => ids.has(row.employeeId)),
    permissions: permissions.filter((row) => ids.has(row.employeeId)),
    departments: [
      ...new Map(
        employees
          .filter((row) => row.department)
          .map((row) => [row.department.id, row.department.name]),
      ).entries(),
    ].sort((a, b) => a[1].localeCompare(b[1])),
    totals: {
      employees: employees.length,
      linked: employees.filter((row) => row._count.devicePeople > 0).length,
      lost: records.reduce(
        (sum, row) => sum + calc.lostMinutes(row, permissions),
        0,
      ),
    },
  };
}
