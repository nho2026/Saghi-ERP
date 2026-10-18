import { paginate } from "../../../shared/database/paginate.js";
import { createHash } from "node:crypto";
import { prisma } from "../../../shared/database/client.js";
export const eventsModel = {
  devices: (id) =>
    prisma.attendanceDevice.findMany({ where: id ? { id } : {} }),
  person: (deviceId, employeeNo) =>
    prisma.attendancePerson.findUnique({
      where: { deviceId_employeeNo: { deviceId, employeeNo } },
    }),
  people: (deviceId) =>
    prisma.attendancePerson.findMany({ where: { deviceId } }),
  existingEvents: (deviceId, deviceEventIds) =>
    deviceEventIds.length
      ? prisma.attendanceEvent.findMany({
          where: { deviceId, deviceEventId: { in: deviceEventIds } },
          select: {
            deviceEventId: true,
            employeeNo: true,
            eventType: true,
            occurredAt: true,
          },
        })
      : Promise.resolve([]),
  saveUnique: async (deviceId, deviceEventId, data) =>
    prisma.$transaction(async (tx) => {
      // Serialize live and sync writes so simultaneous scans cannot both pass.
      await tx.$queryRaw`SELECT id FROM attendance_AttendanceDevice WHERE id = ${deviceId} FOR UPDATE`;
      const existing = await tx.attendanceEvent.findUnique({
        where: { deviceId_deviceEventId: { deviceId, deviceEventId } },
      });
      if (
        existing &&
        existing.employeeNo === data.employeeNo &&
        existing.eventType === data.eventType &&
        existing.occurredAt.getTime() === data.occurredAt.getTime()
      )
        return { event: existing, created: false };
      // Device serial numbers can be reused after its event history is cleared.
      if (existing) {
        deviceEventId = createHash("sha256")
          .update(
            `${deviceEventId}:${data.employeeNo}:${data.eventType}:${data.occurredAt.toISOString()}`,
          )
          .digest("hex");
      }

      const duplicate = await tx.attendanceEvent.findFirst({
        where: {
          deviceId,
          employeeNo: data.employeeNo,
          eventType: data.eventType,
          occurredAt: data.occurredAt,
        },
        orderBy: { occurredAt: "asc" },
      });
      if (duplicate) return { event: duplicate, created: false };

      const identity = { deviceId, employeeNo: data.employeeNo };
      const previous = await tx.attendanceEvent.findFirst({
        where: { ...identity, occurredAt: { lte: data.occurredAt } },
        orderBy: { occurredAt: "desc" },
      });
      const next = await tx.attendanceEvent.findFirst({
        where: { ...identity, occurredAt: { gt: data.occurredAt } },
        orderBy: { occurredAt: "asc" },
      });
      // Also check the following event when importing older terminal history.
      const repeated = [previous, next].find(
        (event) => event?.eventType === data.eventType,
      );
      if (repeated)
        return {
          event: repeated,
          created: false,
          reason: "repeated_attendance_state",
        };

      return {
        event: await tx.attendanceEvent.create({
          data: { deviceId, deviceEventId, ...data },
        }),
        created: true,
      };
    }),
  list: (where, query = {}) =>
    paginate("attendanceEvent", query, {
      where,
      include: {
        device: { select: { name: true } },
        person: { select: { id: true, employeeId: true } },
      },
      orderBy: { occurredAt: query.sort === "asc" ? "asc" : "desc" },
      take: 10000,
    }),
  status: (id, data) => prisma.attendanceDevice.update({ where: { id }, data }),
};
