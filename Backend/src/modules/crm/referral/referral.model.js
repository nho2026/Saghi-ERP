import { prisma } from "../../../shared/database/client.js";

const include = {
  patient: {
    include: { sourceLeads: { orderBy: { createdAt: "desc" }, take: 1 } },
  },
};

export const referralModel = {
  list: (skip, take, where) =>
    Promise.all([
      prisma.patientReferral.findMany({
        include,
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.patientReferral.count({ where }),
    ]),
  create: (data) => prisma.patientReferral.create({ data, include }),
  update: (id, data) =>
    prisma.patientReferral.update({ where: { id }, data, include }),
  remove: (id) => prisma.patientReferral.delete({ where: { id } }),
  broughtCounts: (phones) =>
    prisma.patientReferral.groupBy({
      by: ["referrerPhone"],
      where: { referrerPhone: { in: phones } },
      _count: { patientId: true },
    }),
};
