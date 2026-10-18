import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { defaults, schemas } from "../src/modules/settings/settings.schema.js";

try {
  const data = Object.entries(defaults).map(([category, value]) => ({
    category,
    value: schemas[category].strict().parse(
      category === "organization" ? { ...value, name: "SAGHI" } : value,
    ),
  }));
  const result = await prisma.systemSetting.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`Settings seeded: ${result.count} categories created. Existing settings were preserved.`);
} catch (error) {
  if (error.code === "P2021" || error.code === "P2022") {
    console.error("Settings tables or columns are missing. Apply database migrations before running db:seed-settings.");
  } else {
    console.error(`Settings seed failed (${error.code || error.name || "unknown error"}). Check settings defaults and database connectivity.`);
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
