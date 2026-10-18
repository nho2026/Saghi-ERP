import { paginate } from "../../../shared/database/paginate.js";
import { bookWithProgress } from "../patient/book-with-progress.js";
import { prisma } from "../../../shared/database/client.js";

const appointmentInclude = {
  doctor: { include: { employee: true } },
  department: true,
};

export const appointmentsModel = {
  serve: async (visitId) => {
    const surgery = visitId.startsWith("surgery:");
    const id = surgery ? visitId.slice(8) : visitId;
    const model = surgery ? prisma.surgeryAppointment : prisma.appointment;
    const changed = await model.updateMany({
      where: {
        id,
        status: {
          in: surgery
            ? ["scheduled", "confirmed", "in_progress"]
            : ["pending", "confirmed"],
        },
      },
      data: { status: "completed" },
    });
    if (changed.count !== 1)
      throw Object.assign(
        new Error("This visit is no longer pending. Refresh the patient list."),
        { status: 409 },
      );
    return { id: visitId, status: "completed" };
  },
  todaySurgeries: (start, end) =>
    prisma.surgeryAppointment.findMany({
      where: {
        OR: [
          { scheduledAt: { gte: start, lt: end } },
          { status: "in_progress" },
        ],
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        scheduledAt: true,
        status: true,
        operatingRoom: true,
        patient: { select: { firstName: true, lastName: true, phone: true } },
        doctor: {
          select: {
            employee: { select: { firstName: true, lastName: true } },
            department: { select: { name: true } },
          },
        },
        surgery: { select: { name: true, durationMinutes: true } },
      },
      orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
    }),
  profileCandidates: async (id) => {
    const appointment = await prisma.appointment.findUniqueOrThrow({
      where: { id },
      select: { patientPhone: true },
    });
    if (!appointment.patientPhone.trim()) return [];
    return prisma.patient.findMany({
      where: { phone: appointment.patientPhone },
      select: {
        id: true,
        patientCode: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
      orderBy: [{ firstName: "asc" }, { id: "asc" }],
    });
  },
  today: (start, end) =>
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: start, lt: end } },
      select: {
        id: true,
        patientName: true,
        patientPhone: true,
        scheduledAt: true,
        durationMinutes: true,
        reason: true,
        status: true,
        doctorId: true,
        doctor: {
          select: { employee: { select: { firstName: true, lastName: true } } },
        },
        department: { select: { name: true } },
      },
      orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
    }),
  list: (query = {}) =>
    paginate(
      "appointment",
      query,
      {
        where: {
          ...(query.status && { status: String(query.status) }),
          ...(query.departmentId && {
            departmentId: String(query.departmentId),
          }),
          ...(query.doctorId && { doctorId: String(query.doctorId) }),
        },
        include: appointmentInclude,
        orderBy: { scheduledAt: "desc" },
        take: 1000,
      },
      ["patientName", "patientPhone", "reason"],
    ),
  findById: (id) => prisma.appointment.findUniqueOrThrow({ where: { id } }),
  create: (data, publicBooking = false) => {
    const { patientId, ...fields } = data;
    const create = (db) =>
      db.appointment.create({
        data: fields,
        ...(publicBooking
          ? {
              select: {
                id: true,
                scheduledAt: true,
                status: true,
                createdAt: true,
              },
            }
          : { include: appointmentInclude }),
      });
    return patientId && !publicBooking
      ? bookWithProgress(prisma, patientId, "appointment_requested", create)
      : create(prisma);
  },
  update: (id, data) =>
    prisma.appointment.update({
      where: { id },
      data,
      include: appointmentInclude,
    }),
  remove: (id) => prisma.appointment.delete({ where: { id } }),
  findDoctor: (id) => prisma.healthStaff.findUniqueOrThrow({ where: { id } }),
  findPublicDoctor: (doctorId, departmentId) =>
    prisma.healthStaff.findFirst({
      where: {
        id: doctorId,
        departmentId,
        staffType: "doctor",
        status: "active",
        publicBookingEnabled: true,
      },
    }),
  findConflict: (doctorId, scheduledAt) =>
    prisma.appointment.findFirst({
      where: { doctorId, scheduledAt, status: { not: "cancelled" } },
    }),
};
