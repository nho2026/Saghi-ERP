import "dotenv/config";
import { syncPermissionCatalog } from "../src/shared/security/sync-permissions.js";
import { prisma } from "../src/shared/database/client.js";
try {
  await syncPermissionCatalog();
  console.log("Permission catalog synchronized. Existing role grants were preserved.");
} finally {
  await prisma.$disconnect();
}
