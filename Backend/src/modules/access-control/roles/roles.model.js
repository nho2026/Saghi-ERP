import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
const include = {
  _count: { select: { users: true, permissions: true } },
  permissions: { include: { permission: true } },
};
const permissionWrite = (ids) => ({
  deleteMany: {},
  create: ids.map((permissionId) => ({ permissionId })),
});
export const roleModel = {
  findAll: (query = {}) =>
    paginate("role", query, { include, orderBy: { name: "asc" } }, [
      "name",
      "description",
    ]),
  findById: (id) => prisma.role.findUnique({ where: { id } }),
  create: ({ permissionIds = [], ...data }) =>
    prisma.role.create({
      data: {
        ...data,
        permissions: {
          create: permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include,
    }),
  update: (id, { permissionIds, ...data }) =>
    prisma.role.update({
      where: { id },
      data: {
        ...data,
        ...(permissionIds && { permissions: permissionWrite(permissionIds) }),
      },
      include,
    }),
  assignPermissions: (id, permissionIds) =>
    prisma.role.update({
      where: { id },
      data: { permissions: permissionWrite(permissionIds) },
      include,
    }),
  remove: (id) => prisma.role.delete({ where: { id } }),
};
