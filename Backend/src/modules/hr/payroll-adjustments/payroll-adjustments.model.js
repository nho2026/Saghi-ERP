import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";

const include = { employee: true };

export const payrollAdjustmentModel = {
  findAll: (query = {}) =>
    paginate(
      "payrollAdjustment",
      query,
      {
        where: {
          ...(query.year && { year: Number(query.year) }),
          ...(query.month && { month: Number(query.month) }),
          ...(query.employeeId && { employeeId: String(query.employeeId) }),
        },
        include,
        orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
      },
      ["employee.firstName", "employee.lastName", "employee.employeeCode"],
    ),
  create: (data) => prisma.payrollAdjustment.create({ data, include }),
  update: (id, data) =>
    prisma.payrollAdjustment.update({ where: { id }, data, include }),
  remove: (id) => prisma.payrollAdjustment.delete({ where: { id } }),
};
