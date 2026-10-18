import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { syncPermissionCatalog } from "../src/shared/security/sync-permissions.js";
import { seedLaboratoryRoles } from "../src/shared/security/laboratory-roles.js";
try {
  await syncPermissionCatalog();
  await seedLaboratoryRoles(prisma);
  console.log("Laboratory roles are ready. Existing roles and user assignments were preserved.");
} catch (error) {
  console.error(`Laboratory role setup failed (${error.code || error.name}).`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
