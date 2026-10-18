import { seedLaboratoryRoles } from "../src/shared/security/laboratory-roles.js";
import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { syncPermissionCatalog } from "../src/shared/security/sync-permissions.js";

try {
  // Check schema availability before writing any seed data.
  await prisma.permission.count();
  await prisma.role.count();
  await prisma.rolePermission.count();

  await syncPermissionCatalog();
  await seedLaboratoryRoles(prisma);
  const permissions = await prisma.permission.findMany({ select: { id: true } });
  await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({
      where: { name: "Super Administrator" },
      update: {},
      create: {
        name: "Super Administrator",
        description: "Unrestricted access to every current and future system capability",
      },
    });
    await tx.rolePermission.createMany({
      data: permissions.map(({ id }) => ({ roleId: role.id, permissionId: id })),
      skipDuplicates: true,
    });
  });
  console.log(`Access control seeded: ${permissions.length} permissions available to Super Administrator.`);
  console.log("Existing users, passwords, role assignments, and other role grants were preserved.");
} catch (error) {
  if (error.code === "P2021" || error.code === "P2022") {
    console.error("Access-control tables or columns are missing. Complete the database schema migration before running db:seed-access. A cancelled db:push does not create the required tables.");
  } else {
    console.error(`Access-control seed failed (${error.code || error.name || "unknown error"}). Check database connectivity and permissions.`);
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
