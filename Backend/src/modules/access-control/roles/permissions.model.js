import { assignablePermissionCatalog } from "../../../shared/security/access-policy.js";
import { prisma } from "../../../shared/database/client.js";
export const permissionModel = {
  findAll: () =>
    prisma.permission.findMany({
      where: { key: { in: assignablePermissionCatalog.map(({ key }) => key) } },
      orderBy: [{ module: "asc" }, { name: "asc" }],
    }),
};
