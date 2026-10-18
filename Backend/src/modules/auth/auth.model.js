import { paginate } from "../../shared/database/paginate.js";
import { prisma } from "../../shared/database/client.js";

const roles = {
  roles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
};
const profileInclude = {
  ...roles,
  employee: {
    include: {
      position: true,
      department: { include: { manager: { select: { id: true } } } },
      devicePeople: {
        select: {
          id: true,
          employeeNo: true,
          device: { select: { id: true, name: true } },
        },
      },
    },
  },
};
const loginInclude = {
  ...roles,
  employee: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      departmentId: true,
      department: { select: { managerId: true } },
      status: true,
    },
  },
};
export const authModel = {
  findByLogin: (login, db = prisma) =>
    db.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] },
      include: loginInclude,
    }),
  findByPinLookup: (pinLookup, db = prisma) =>
    db.user.findUnique({ where: { pinLookup }, include: loginInclude }),
  getProfile: (id) =>
    prisma.user.findUniqueOrThrow({ where: { id }, include: profileInclude }),
  updateProfile: (id, data) =>
    prisma.user.update({ where: { id }, data, include: profileInclude }),
  getEmployeeIdentity: (userId) =>
    prisma.employee.findUnique({
      where: { userId },
      include: { devicePeople: { select: { employeeNo: true } } },
    }),
  findOwnEvents: (employeeId, query = {}) =>
    paginate("attendanceEvent", query, {
      where: { person: { employeeId } },
      include: { device: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 100,
    }),
};
