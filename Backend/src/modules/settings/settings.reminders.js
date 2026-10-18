import { prisma } from "../../shared/database/client.js";
import { getSettings } from "./settings.service.js";
let busy = false;
export async function sendReminders() {
  if (busy) return;
  busy = true;
  try {
    const policy = await getSettings("notifications");
    const now = new Date();
    if (policy.appointmentReminders) {
      const appointments = await prisma.appointment.findMany({
        where: {
          scheduledAt: {
            gte: now,
            lte: new Date(+now + policy.reminderMinutes * 60000),
          },
          status: { in: ["pending", "confirmed"] },
          doctorId: { not: null },
        },
        include: { doctor: { include: { employee: true } } },
      });
      for (const appointment of appointments) {
        const userId = appointment.doctor?.employee.userId;
        if (!userId) continue;
        const reminderKey = `appointment:${appointment.id}:${+appointment.scheduledAt}:${userId}`;
        await prisma.notification.upsert({
          where: { reminderKey },
          update: {},
          create: {
            reminderKey,
            userId,
            type: "appointment_reminder",
            title: "Upcoming appointment",
            body: `${appointment.patientName} has an upcoming appointment.`,
            route: "/crm/appointments",
          },
        });
      }
    }
    if (policy.meetingReminders) {
      const meetings = await prisma.meeting.findMany({
        where: {
          status: "active",
          createdAt: {
            gte: new Date(+now - 24 * 3600000),
            lte: new Date(+now - policy.reminderMinutes * 60000),
          },
        },
        include: { participants: { select: { userId: true } } },
      });
      for (const meeting of meetings) {
        const recipients = await prisma.user.findMany({
          where: {
            status: "active",
            employee: { is: { departmentId: meeting.departmentId } },
            id: { notIn: meeting.participants.map((p) => p.userId) },
          },
          select: { id: true },
        });
        for (const { id: userId } of recipients) {
          const reminderKey = `meeting:${meeting.id}:${userId}`;
          await prisma.notification.upsert({
            where: { reminderKey },
            update: {},
            create: {
              reminderKey,
              userId,
              meetingId: meeting.id,
              type: "meeting_reminder",
              title: meeting.title,
              body: "Your department has an active meeting.",
              route: "/meetings",
            },
          });
        }
      }
    }
  } finally {
    busy = false;
  }
}
export function startReminders() {
  const timer = setInterval(
    () =>
      void sendReminders().catch((e) =>
        console.error("Meeting/appointment reminders failed:", e.message),
      ),
    60000,
  );
  timer.unref();
  return () => clearInterval(timer);
}
