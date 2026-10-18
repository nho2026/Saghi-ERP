import { prisma } from "../../../shared/database/client.js";

export const patientModel = {
  list: (skip, take, where) =>
    Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          sourceLeads: { orderBy: { createdAt: "desc" }, take: 1 },
          surgeryAppointments: {
            include: { surgery: true },
            orderBy: { scheduledAt: "desc" },
            take: 1,
          },
          _count: {
            select: { surgeryAppointments: true, formSubmissions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.patient.count({ where }),
    ]),
  async profile(id) {
    const patient = await prisma.patient.findUniqueOrThrow({
      where: { id },
      include: {
        sourceLeads: { orderBy: { createdAt: "desc" } },
        surgeryAppointments: {
          include: {
            surgery: true,
            doctor: { include: { employee: true } },
          },
          orderBy: { scheduledAt: "desc" },
        },
        payments: { orderBy: { paidAt: "desc" } },
        referrals: { orderBy: { referredAt: "desc" } },
      },
    });
    const appointments = await prisma.appointment.findMany({
      where: { patientPhone: patient.phone },
      include: {
        department: true,
        doctor: { include: { employee: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
    return { patient, appointments };
  },
};
