import { prisma } from "../../shared/database/client.js";

export const employeePortalModel = {
  findAttendance: async (employeeId, month) => {
    const [year, monthNumber] = month.split("-").map(Number);
    const from = new Date(`${month}-01T00:00:00+03:00`);
    const to = new Date(Date.UTC(year, monthNumber, 1) - 3 * 3600000);
    const [employee, events, manual] = await Promise.all([
      prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          scheduleType: true,
          workSchedule: true,
          checkInTime: true,
          checkOutTime: true,
        },
      }),
      prisma.attendanceEvent.findMany({
        where: { person: { employeeId }, occurredAt: { gte: from, lt: to } },
        select: {
          id: true,
          occurredAt: true,
          eventType: true,
          person: { select: { id: true, employeeId: true } },
        },
        orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
      }),
      prisma.employeeAttendance.findMany({
        where: {
          employeeId,
          attendanceDate: {
            gte: new Date(`${month}-01T00:00:00Z`),
            lt: new Date(Date.UTC(year, monthNumber, 1)),
          },
        },
      }),
    ]);
    return { employee, events, manual };
  },
  findTasks: (employeeId) =>
    prisma.task.findMany({
      where: { assignees: { some: { employeeId } } },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    }),
  findIdeas: (userId) =>
    prisma.employeeIdea.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  createIdea: (data) => prisma.employeeIdea.create({ data }),
  findWarnings: (userId) =>
    prisma.warningRecipient.findMany({
      where: { userId },
      include: {
        warning: { include: { sender: { select: { id: true, name: true } } } },
      },
      orderBy: { warning: { createdAt: "desc" } },
    }),
};
