import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
const include = { employee: true, salary: true };
export const payrollModel = {
  findAll: (q = {}) =>
    paginate(
      "payroll",
      q,
      {
        where: {
          ...(q.year && { year: Number(q.year) }),
          ...(q.month && { month: Number(q.month) }),
        },
        include,
        orderBy: [{ year: "desc" }, { month: "desc" }],
      },
      ["employee.firstName", "employee.lastName", "employee.employeeCode"],
    ),
  findById: (id) => prisma.payroll.findUniqueOrThrow({ where: { id } }),
  create: (data) => prisma.payroll.create({ data, include }),
  update: (id, data) => prisma.payroll.update({ where: { id }, data, include }),
  remove: (id) => prisma.payroll.delete({ where: { id } }),
};
