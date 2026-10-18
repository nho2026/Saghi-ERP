import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
export const teamModel = {
  findAll: (query = {}) =>
    paginate(
      "team",
      query,
      {
        include: {
          leader: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { employees: true } },
        },
        orderBy: { name: "asc" },
      },
      ["name"],
    ),
  create: (data) =>
    prisma.team.create({
      data,
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { employees: true } },
      },
    }),
  update: (id, data) =>
    prisma.team.update({
      where: { id },
      data,
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { employees: true } },
      },
    }),
  remove: (id) => prisma.team.delete({ where: { id } }),
};
