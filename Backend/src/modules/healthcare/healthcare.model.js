import { paginate } from "../../shared/database/paginate.js";
import { prisma } from "../../shared/database/client.js";
const departmentInclude = {
    manager: {
      select: { id: true, employeeCode: true, firstName: true, lastName: true },
    },
    _count: {
      select: { employees: true, healthStaff: true, appointments: true },
    },
  },
  staffInclude = {
    employee: { include: { position: true } },
    department: true,
    _count: { select: { appointments: true } },
  };
export const healthcareModel = {
  getDepartment: (id) =>
    prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { healthStaff: true, appointments: true } },
      },
    }),
  getStaff: (id) => prisma.healthStaff.findUniqueOrThrow({ where: { id } }),
  listDepartments: (query = {}) =>
    paginate(
      "department",
      query,
      {
        include: departmentInclude,
        orderBy: { name: "asc" },
      },
      ["code", "name"],
    ),
  createDepartment: async (data) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const departments = await prisma.department.findMany({
        select: { code: true },
      });
      const next =
        departments.reduce(
          (max, { code }) =>
            /^DEP-[1-9][0-9]*$/.test(code)
              ? BigInt(code.slice(4)) > max
                ? BigInt(code.slice(4))
                : max
              : max,
          0n,
        ) + 1n;
      try {
        return await prisma.department.create({
          data: { ...data, code: `DEP-${next}` },
          include: departmentInclude,
        });
      } catch (error) {
        if (
          error.code !== "P2002" ||
          (await prisma.department.findUnique({ where: { name: data.name } }))
        )
          throw error;
      }
    }
    throw Object.assign(
      new Error("Unable to allocate a department code. Please retry."),
      { status: 409 },
    );
  },
  updateDepartment: (id, data) =>
    prisma.department.update({
      where: { id },
      data,
      include: departmentInclude,
    }),
  removeDepartment: async (id) => {
    await healthcareModel.removeDepartments([id]);
  },
  removeDepartments: async (ids) =>
    prisma.$transaction(async (tx) => {
      await tx.financeCashFlow.updateMany({
        where: { departmentId: { in: ids } },
        data: { departmentId: null },
      });
      const result = await tx.department.deleteMany({
        where: { id: { in: ids } },
      });
      if (result.count !== ids.length)
        throw Object.assign(
          new Error("One or more departments no longer exist."),
          { status: 409 },
        );
      return { success: true, deletedCount: result.count };
    }),
  assignDepartment: (employeeId, departmentId) =>
    prisma.employee.update({
      where: { id: employeeId },
      data: { departmentId },
    }),
  listStaff: (q = {}) =>
    paginate(
      "healthStaff",
      q,
      {
        where: {
          ...(q.staffType && { staffType: String(q.staffType) }),
          ...(q.departmentId && { departmentId: String(q.departmentId) }),
        },
        include: staffInclude,
        orderBy: { createdAt: "desc" },
      },
      ["employee.firstName", "employee.lastName", "employee.employeeCode"],
    ),
  createStaff: (input) =>
    prisma.$transaction(async (tx) => {
      const { positionId, ...data } = input;
      await setStaffPosition(tx, data.employeeId, positionId);
      return tx.healthStaff.create({ data, include: staffInclude });
    }),
  updateStaff: (id, input) =>
    prisma.$transaction(async (tx) => {
      const { positionId, ...data } = input;
      const current = await tx.healthStaff.findUniqueOrThrow({ where: { id } });
      await setStaffPosition(
        tx,
        data.employeeId ?? current.employeeId,
        positionId,
      );
      return tx.healthStaff.update({
        where: { id },
        data,
        include: staffInclude,
      });
    }),
  removeStaff: (id) => prisma.healthStaff.delete({ where: { id } }),
  publicDepartments: () =>
    prisma.department.findMany({
      where: { status: "active", type: "hospital" },
      select: { id: true, code: true, name: true, description: true },
      orderBy: { name: "asc" },
    }),
  publicDoctors: (departmentId) =>
    prisma.healthStaff.findMany({
      where: {
        staffType: "doctor",
        status: "active",
        publicBookingEnabled: true,
        ...(departmentId && { departmentId: String(departmentId) }),
      },
      select: {
        id: true,
        specialization: true,
        biography: true,
        department: { select: { id: true, name: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
      orderBy: { employee: { firstName: "asc" } },
    }),
};

async function setStaffPosition(tx, employeeId, positionId) {
  if (positionId === undefined) return;
  if (positionId) {
    const [position, employee] = await Promise.all([
      tx.position.findUnique({ where: { id: positionId } }),
      tx.employee.findUnique({ where: { id: employeeId } }),
    ]);
    if (
      !position ||
      (position.status !== "active" && employee?.positionId !== positionId)
    )
      throw Object.assign(new Error("Select an active position."), {
        status: 400,
      });
  }
  await tx.employee.update({ where: { id: employeeId }, data: { positionId } });
}
