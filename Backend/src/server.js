import { startWhatsappAutoReplies } from "./modules/crm/whatsapp/whatsapp.worker.js";
import { attachLaboratoryRealtime } from "./modules/laboratory/laboratory.realtime.js";
import { syncPermissionCatalog } from "./shared/security/sync-permissions.js";
import { startReminders } from "./modules/settings/settings.reminders.js";
import { startBackupSchedule } from "./modules/settings/settings.backups.js";
import { app } from "./app.js";
import { createServer } from "node:http";
import { env } from "./config/environment.js";
import { prisma } from "./shared/database/client.js";
import {
  startAttendanceStreams,
  stopAttendanceStreams,
} from "./modules/attendance/events/events.live.js";
import { attachMeetingSignaling } from "./modules/meetings/meetings.signaling.js";

await syncPermissionCatalog();

const stopWhatsappAutoReplies = startWhatsappAutoReplies();
const stopReminders = startReminders();
const stopBackups = startBackupSchedule();
const server = createServer(app);
const signaling = attachMeetingSignaling(
  server,
  [env.frontendUrl, ...env.publicWebsiteUrls],
  env.production,
);
attachLaboratoryRealtime(signaling);
server.listen(env.port, () =>
  console.log(`API listening on http://localhost:${env.port}`),
);
startAttendanceStreams().catch((error) =>
  console.error("Attendance streams failed to start:", error),
);
const shutdown = async () => {
  await stopWhatsappAutoReplies();
  stopAttendanceStreams();
  stopBackups();
  stopReminders();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
