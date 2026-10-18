import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { hashSecret } from "../src/core/security/BcryptPasswordHasher.js";

try {
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!password) {
    throw new Error("Set SUPERADMIN_PASSWORD before running db:create-superadmin.");
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("SUPERADMIN_PASSWORD must not exceed 72 UTF-8 bytes.");
  }

  const passwordHash = await hashSecret(password);
  await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({
      where: { name: "Super Administrator" },
      update: {},
      create: {
        name: "Super Administrator",
        description: "Unrestricted access to every current and future system capability",
      },
    });
    const user = await tx.user.upsert({
      where: { username: "superadmin" },
      update: { passwordHash, status: "active" },
      create: {
        username: "superadmin",
        email: "superadmin@admin.local",
        name: "Super Administrator",
        department: "Administration",
        status: "active",
        passwordHash,
      },
    });
    await tx.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  });

  console.log("Superadmin ready. Username: superadmin. Password set from SUPERADMIN_PASSWORD.");
} catch (error) {
  if (!process.env.SUPERADMIN_PASSWORD || error.message?.startsWith("SUPERADMIN_PASSWORD")) {
    console.error(error.message);
  } else {
    console.error(`Superadmin setup failed (${error.code || error.name || "unknown error"}). Check database connectivity, schema migrations, and email uniqueness.`);
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
