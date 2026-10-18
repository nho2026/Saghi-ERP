import { prisma } from "../../shared/database/client.js";

export const employeePortalModel = {
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
