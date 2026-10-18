import { prisma } from "../../../shared/database/client.js";
import { summarizeCashFlows } from "./cash-flow.report.js";

async function checkDepartment(data) {
  if (
    data.departmentId &&
    !(await prisma.department.findUnique({
      where: { id: data.departmentId },
      select: { id: true },
    }))
  ) {
    throw Object.assign(new Error("Select an existing department."), {
      status: 422,
    });
  }
}
export const cashFlowModel = {
  async findPage(page, pageSize, where = {}) {
    const [items, total] = await prisma.$transaction([
      prisma.financeCashFlow.findMany({
        where,
        include: { department: { select: { id: true, name: true } } },
        orderBy: [{ flowDate: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.financeCashFlow.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },
  async report(where) {
    const groups = await prisma.financeCashFlow.groupBy({
      by: ["departmentId", "category", "currency", "flowType"],
      where: { AND: [where, { status: "confirmed" }] },
      _sum: { amount: true },
      orderBy: [
        { departmentId: "asc" },
        { category: "asc" },
        { currency: "asc" },
      ],
    });
    return summarizeCashFlows(groups);
  },
  async options() {
    const [departments, categories] = await Promise.all([
      prisma.department.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.financeCashFlow.findMany({
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
    ]);
    return { departments, categories: categories.map((row) => row.category) };
  },
  async create(data) {
    await checkDepartment(data);
    return prisma.financeCashFlow.create({ data });
  },
  async update(id, data) {
    await checkDepartment(data);
    return prisma.financeCashFlow.update({ where: { id }, data });
  },
  remove: (id) => prisma.financeCashFlow.delete({ where: { id } }),
};
