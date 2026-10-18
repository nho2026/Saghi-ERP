import { prisma } from "../../shared/database/client.js";

export const auditedActions = ["login", "create", "update", "delete"];

export const systemLogsModel = {
  list: (where, skip, take) =>
    Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where: { action: { in: auditedActions } },
        distinct: ["module"],
        select: { module: true },
        orderBy: { module: "asc" },
      }),
    ]),
};
