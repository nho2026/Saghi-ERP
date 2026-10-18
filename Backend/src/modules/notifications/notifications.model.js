import { getSettings } from "../settings/settings.service.js";
import { prisma } from "../../shared/database/client.js";

const taskSelect = { id: true, title: true, priority: true, dueDate: true };

export const notificationModel = {
  async list(userId) {
    const policy = await getSettings("notifications");
    const where = {
      userId,
      AND: [
        ...(!policy.taskAlerts ? [{ taskId: null }] : []),
        ...(!policy.meetingReminders ? [{ meetingId: null }] : []),
        ...(!policy.appointmentReminders
          ? [{ type: { not: "appointment_reminder" } }]
          : []),
      ],
    };
    const [items, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        include: {
          task: { select: taskSelect },
          warning: {
            select: { id: true, title: true, message: true, severity: true },
          },
          meeting: {
            select: {
              id: true,
              title: true,
              roomCode: true,
              department: { select: { id: true, name: true } },
            },
          },
          crmLead: {
            select: { id: true, name: true, phone: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({ where: { ...where, readAt: null } }),
    ]);
    return { items, unreadCount };
  },
  markRead: (id, userId) =>
    prisma.$transaction(async (tx) => {
      const notification = await tx.notification.findFirst({
        where: { id, userId },
        select: { warningId: true },
      });
      await tx.notification.updateMany({
        where: { id, userId, readAt: null },
        data: { readAt: new Date() },
      });
      if (notification?.warningId)
        await tx.warningRecipient.updateMany({
          where: { warningId: notification.warningId, userId },
          data: { readAt: new Date() },
        });
    }),
  markAllRead: (userId) =>
    prisma.$transaction([
      prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      }),
      prisma.warningRecipient.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      }),
    ]),
};
