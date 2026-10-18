import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../../../shared/database/paginate.js";
export const deviceModel = {
  findAll: (query = {}) =>
    paginate("attendanceDevice", query, { orderBy: { createdAt: "desc" } }, [
      "name",
      "ipAddress",
    ]),
  findById: (id) =>
    prisma.attendanceDevice.findUniqueOrThrow({ where: { id } }),
  create: (data) => prisma.attendanceDevice.create({ data }),
  update: (id, data) => prisma.attendanceDevice.update({ where: { id }, data }),
  remove: (id) => prisma.attendanceDevice.delete({ where: { id } }),
};
