import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
export const positionModel = {
  findAll: (query = {}) =>
    paginate(
      "position",
      query,
      {
        include: { _count: { select: { employees: true } } },
        orderBy: { name: "asc" },
      },
      ["name"],
    ),
  create: (data) =>
    prisma.position.create({
      data,
      include: { _count: { select: { employees: true } } },
    }),
  update: (id, data) =>
    prisma.position.update({
      where: { id },
      data,
      include: { _count: { select: { employees: true } } },
    }),
  remove: (id) => prisma.position.delete({ where: { id } }),
};
