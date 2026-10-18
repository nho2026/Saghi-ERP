import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { createWithCode } from "../src/shared/database/automatic-code.js";
import { defaults } from "../src/modules/settings/settings.schema.js";
import {
  assignablePermissionCatalog,
  effectivePermissions,
} from "../src/shared/security/access-policy.js";
import { syncPermissionCatalog } from "../src/shared/security/sync-permissions.js";

try {
  await syncPermissionCatalog();
  const hrKeys = [...effectivePermissions([
    ...assignablePermissionCatalog
      .filter(({ module }) => module.startsWith("hr.") || module === "healthcare.departments")
      .map(({ key }) => key),
    "dashboard.view",
  ])];
  await prisma.$transaction(async (tx) => {
    const permissions = await tx.permission.findMany({ select: { id: true, key: true } });
    const hrPermissions = permissions.filter(({ key }) => hrKeys.includes(key));
    if (hrPermissions.length !== hrKeys.length) {
      throw new Error("HR permission catalog is incomplete.");
    }
    // Preserve customized grants when the HR role already exists.
    await tx.role.upsert({
      where: { name: "HR Manager" },
      update: {},
      create: {
        name: "HR Manager",
        description: "Manages human resources, payroll and departments",
        permissions: { create: hrPermissions.map(({ id }) => ({ permissionId: id })) },
      },
    });
    const adminRole = await tx.role.upsert({
      where: { name: "Super Administrator" },
      update: {},
      create: {
        name: "Super Administrator",
        description: "Unrestricted access to every current and future system capability",
      },
    });
    await tx.rolePermission.createMany({
      data: permissions.map(({ id }) => ({ roleId: adminRole.id, permissionId: id })),
      skipDuplicates: true,
    });
    const admin = await tx.user.findUnique({ where: { username: "superadmin" } });
    if (admin) {
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
        update: {},
        create: { userId: admin.id, roleId: adminRole.id },
      });
    }
    for (const name of ["Human Resources", "Administration", "Finance"]) {
      if (await tx.department.findUnique({ where: { name } })) continue;
      await createWithCode(tx.department, {
        data: { name, type: "office", status: "active" },
      }, "DEP");
    }
    for (const name of ["HR Manager", "HR Officer", "Accountant", "Administrative Assistant"]) {
      await tx.position.upsert({
        where: { name }, update: {}, create: { name, status: "active" },
      });
    }
    for (const name of ["Human Resources", "Administration", "Finance"]) {
      await tx.team.upsert({
        where: { name }, update: {}, create: { name, status: "active" },
      });
    }
    await tx.systemSetting.upsert({
      where: { category: "hr" }, update: {},
      create: { category: "hr", value: defaults.hr },
    });
  }, { timeout: 30_000 });
  console.log("HR setup and HR Manager / Super Administrator roles seeded. Existing records, passwords and customized HR grants were preserved.");
  console.log("The Super Administrator role was assigned to superadmin if that account exists. No employee or login accounts were created.");
} catch (error) {
  console.error(`HR seed failed (${error.code || error.name || "unknown error"}). Check database connectivity and apply schema migrations first.`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
