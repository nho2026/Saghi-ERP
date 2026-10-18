import { prisma } from "../database/client.js";
import { permissionCatalog } from "./access-policy.js";
import { setTimeout as delay } from "node:timers/promises";

const retryableCodes = new Set([
  "P1001", // Database is temporarily unreachable.
  "P1002", // Connection timed out.
  "P1008", // Operation timed out.
  "P1017", // Connection was closed.
  "P2024", // Connection pool timed out.
  "P2034", // Transaction conflict/deadlock; the transaction was rolled back.
]);
const retryDelays = [1000, 2000, 4000, 8000, 15000];

// Only add/update catalog entries. Never reset role grants or seed business data.
export async function syncPermissionCatalog({
  db = prisma,
  wait = delay,
  warn = console.warn,
} = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      await db.$transaction(
        permissionCatalog.map(({ key, name, module }) =>
          db.permission.upsert({
            where: { key },
            create: { key, name, module },
            update: { name, module },
          }),
        ),
      );
      return;
    } catch (error) {
      if (!retryableCodes.has(error.code) || attempt >= retryDelays.length)
        throw error;
      const milliseconds = retryDelays[attempt];
      warn(
        `Permission catalog sync failed (${error.code}); retrying in ${milliseconds / 1000}s. API startup is waiting for the database.`,
      );
      await wait(milliseconds);
    }
  }
}
