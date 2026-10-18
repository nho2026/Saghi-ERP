import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
const include = {
  warehouse: { select: { id: true, name: true } },
  roles: { include: { role: true } },
};
export const userModel = {
  storageOptions: () =>
    prisma.inventoryWarehouse.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  findWarehouse: (id) =>
    prisma.inventoryWarehouse.findUnique({
      where: { id },
      select: { id: true, status: true },
    }),
  isHospitalDepartment: (name) =>
    name
      ? prisma.department
          .count({ where: { name, type: "hospital", status: "active" } })
          .then((count) => count > 0)
      : Promise.resolve(false),
  hasSuperadminRole: (roleIds) =>
    prisma.role
      .count({ where: { id: { in: roleIds }, name: "Super Administrator" } })
      .then((count) => count > 0),
  findById: (id) => prisma.user.findUniqueOrThrow({ where: { id }, include }),
  findAll: (query = {}) =>
    paginate("user", query, { include, orderBy: { createdAt: "desc" } }, [
      "name",
      "username",
      "email",
    ]),
  create: (data) => prisma.user.create({ data, include }),
  update: (id, data) => prisma.user.update({ where: { id }, data, include }),
  remove: (id, replacementUserId) =>
    prisma.$transaction(async (tx) => {
      await tx.employeeTarget.updateMany({
        where: { createdById: id },
        data: { createdById: replacementUserId },
      });
      await tx.task.updateMany({
        where: { createdById: id },
        data: { createdById: replacementUserId },
      });
      await tx.warning.updateMany({
        where: { senderId: id },
        data: { senderId: replacementUserId },
      });
      await tx.taskTimeEntry.updateMany({
        where: { recordedById: id },
        data: { recordedById: replacementUserId },
      });
      await tx.meeting.updateMany({
        where: { creatorId: id },
        data: { creatorId: replacementUserId },
      });
      return tx.user.delete({ where: { id } });
    }),
  updatePassword: (id, passwordHash) =>
    prisma.user.update({ where: { id }, data: { passwordHash } }),
};
