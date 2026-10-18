import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { defaults } from "../src/modules/settings/settings.schema.js";

try {
  const columns = await prisma.$queryRaw`
    SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME IN ('currency', 'currencyId') AND COLUMN_DEFAULT = 'IQD'
  `;
  for (const { tableName, columnName } of columns) {
    if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !/^[a-zA-Z0-9_]+$/.test(columnName))
      throw new Error("Unexpected currency column identifier.");
    await prisma.$executeRawUnsafe(`ALTER TABLE \`${tableName}\` ALTER COLUMN \`${columnName}\` SET DEFAULT 'USD'`);
  }
  await prisma.$transaction(async (tx) => {
    const setting = await tx.systemSetting.findUnique({ where: { category: "finance" } });
    const value = { ...defaults.finance, ...(setting?.value ?? {}), currency: "USD" };
    await tx.systemSetting.upsert({ where: { category: "finance" }, create: { category: "finance", value }, update: { value } });
  });
  console.log(`USD default configured; ${columns.length} database defaults updated. Existing record currencies and amounts unchanged.`);
} finally { await prisma.$disconnect(); }
