import { seedLaboratoryRoles } from "../src/shared/security/laboratory-roles.js";
import { readFile } from "node:fs/promises";
import { prisma } from "../src/shared/database/client.js";
import { syncPermissionCatalog } from "../src/shared/security/sync-permissions.js";

try {
  const sql = await readFile(
    new URL("./sql/laboratory.sql", import.meta.url),
    "utf8",
  );
  for (const statement of sql
    .split(";")
    .map((s) => s.replace(/^--.*$/gm, "").trim())
    .filter(Boolean)) {
    const table = /CREATE TABLE `(laboratory_[^`]+)`/.exec(statement)?.[1];
    const constraint = /ADD CONSTRAINT `([^`]+)`/.exec(statement)?.[1];
    if (table) {
      const existing =
        await prisma.$queryRaw`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${table}`;
      if (existing.length) continue;
    }
    if (constraint) {
      const existing =
        await prisma.$queryRaw`SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ${constraint}`;
      if (existing.length) continue;
    }
    await prisma.$executeRawUnsafe(statement);
  }
  const attachmentColumns =
    await prisma.$queryRaw`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'laboratory_Orders' AND COLUMN_NAME = 'attachments'`;
  if (!attachmentColumns.length) {
    await prisma.$executeRaw`ALTER TABLE laboratory_Orders ADD COLUMN attachments JSON NULL`;
  }
  for (const column of [
    "accountingCalledAt",
    "accountingCalledByName",
    "receivedAt",
    "contactedAt",
    "deliveredAt",
    "contactedByName",
    "deliveredByName",
  ]) {
    const existing =
      await prisma.$queryRaw`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'laboratory_Orders' AND COLUMN_NAME = ${column}`;
    if (!existing.length) {
      const type = column.endsWith("At") ? "DATETIME(3)" : "VARCHAR(191)";
      await prisma.$executeRawUnsafe(
        `ALTER TABLE laboratory_Orders ADD COLUMN ${column} ${type} NULL`,
      );
    }
  }
  await syncPermissionCatalog();
  await seedLaboratoryRoles(prisma);
  console.log(
    "Laboratory tables and permissions are ready. Existing role grants were preserved.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
