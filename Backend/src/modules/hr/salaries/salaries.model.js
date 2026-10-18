import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
export const salaryModel = {
  findAll: (query = {}) =>
    paginate(
      "employeeSalary",
      query,
      {
        include: { employee: true },
        orderBy: { effectiveFrom: "desc" },
      },
      ["employee.firstName", "employee.lastName", "employee.employeeCode"],
    ),
  create: (data) =>
    prisma.employeeSalary.create({
      data,
      include: { employee: true },
    }),
  update: (id, data) =>
    prisma.employeeSalary.update({
      where: { id },
      data,
      include: { employee: true },
    }),
  remove: (id) => prisma.employeeSalary.delete({ where: { id } }),
};
