import { employeePortalModel } from "./employee-portal.model.js";
import { getSettings } from "../settings/settings.service.js";
import { monthlyCalculations } from "../hr/reports/monthly-calculations.js";

export const employeePortalService = {
  myAttendance: async ({ user, month }) => {
    if (!user.employee?.id) return { linked: false, records: [] };
    const [data, hr] = await Promise.all([
      employeePortalModel.findAttendance(user.employee.id, month),
      getSettings("hr"),
    ]);
    const { employee, events, manual } = JSON.parse(JSON.stringify(data));
    const device = monthlyCalculations({ hr }).deviceAttendanceRecords(
      events,
      [],
      employee ? [employee] : [],
      month,
    );
    // Device punches take precedence on dates with both device and manual records.
    const byDate = new Map(
      manual.map((record) => [record.attendanceDate.slice(0, 10), record]),
    );
    for (const record of device)
      byDate.set(record.attendanceDate.slice(0, 10), record);
    return {
      linked: true,
      records: [...byDate.values()]
        .map((record) => ({
          attendanceDate: record.attendanceDate.slice(0, 10),
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          workedMinutes: record.workedMinutes,
          lateMinutes: record.lateMinutes,
          status: record.status,
        }))
        .sort((a, b) => a.attendanceDate.localeCompare(b.attendanceDate)),
    };
  },
  myTasks: async ({ user }) => {
    if (!user.employee?.id) return [];
    return employeePortalModel.findTasks(user.employee.id);
  },
  ideas: async ({ user }) => employeePortalModel.findIdeas(user.id),
  createIdea: async ({ user, body }) =>
    employeePortalModel.createIdea({
      ...body,
      userId: user.id,
    }),
  warnings: async ({ user }) => employeePortalModel.findWarnings(user.id),
};
