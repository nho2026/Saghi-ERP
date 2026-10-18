import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";

const include = { employee: { include: { position: true } } };
export const attendancePermissionModel = {
  findApprovedOverlap: ({ employeeId, fromDate, toDate }) =>
    prisma.attendancePermission.findFirst({
      where: {
        employeeId,
        status: "approved",
        fromDate: { lte: toDate },
        toDate: { gte: fromDate },
      },
      select: { id: true },
    }),
  findAll: (query = {}) =>
    paginate(
      "attendancePermission",
      query,
      {
        where: {
          ...(query.employeeId && { employeeId: query.employeeId }),
          ...(query.status && { status: query.status }),
          ...((query.from || query.to) && {
            fromDate: { ...(query.to && { lte: new Date(query.to) }) },
            toDate: { ...(query.from && { gte: new Date(query.from) }) },
          }),
        },
        include,
        orderBy: { fromDate: "desc" },
      },
      ["employee.firstName", "employee.lastName", "employee.employeeCode"],
    ),
  create: (data) => prisma.attendancePermission.create({ data, include }),
  update: (id, data) =>
    prisma.attendancePermission.update({ where: { id }, data, include }),
  remove: (id) => prisma.attendancePermission.delete({ where: { id } }),
};
