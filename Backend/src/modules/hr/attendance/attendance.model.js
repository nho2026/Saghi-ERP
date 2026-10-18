import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
export const attendanceModel = {
  findAll: (query = {}) =>
    paginate(
      "employeeAttendance",
      query,
      {
        where: query.employeeId ? { employeeId: String(query.employeeId) } : {},
        include: { employee: true },
        orderBy: { attendanceDate: "desc" },
      },
      ["employee.firstName", "employee.lastName", "employee.employeeCode"],
    ),
  create: (data) =>
    prisma.employeeAttendance.create({ data, include: { employee: true } }),
  update: (id, data) =>
    prisma.employeeAttendance.update({
      where: { id },
      data,
      include: { employee: true },
    }),
  remove: (id) => prisma.employeeAttendance.delete({ where: { id } }),
};
