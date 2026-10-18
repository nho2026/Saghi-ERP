import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/shared/database/client.js";

// Preview by default. Intended for Windows dumps restored to case-sensitive MySQL.
const quote = name => `\`${name.replaceAll("`", "``")}\``;
try {
  const [config] = await prisma.$queryRaw`SELECT DATABASE() AS db, @@lower_case_table_names AS mode`;
  console.log(`Database: ${config.db}; lower_case_table_names: ${config.mode}`);
  if (Number(config.mode) !== 0) {
    console.log("This server resolves table names without case sensitivity; no case repair is needed.");
  } else {
    const tables = await prisma.$queryRaw`SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'`;
    const expected = Prisma.dmmf.datamodel.models.map(model => model.dbName || model.name);
    const renames = [];
    const missing = [];
    for (const target of expected) {
      const matches = tables.filter(table => table.name.toLowerCase() === target.toLowerCase());
      if (matches.length > 1) throw new Error(`Ambiguous table names for ${target}; manual review required.`);
      if (!matches.length) missing.push(target);
      else if (matches[0].name !== target) renames.push([matches[0].name, target]);
    }
    if (missing.length) throw new Error(`Tables are missing, not just differently capitalized: ${missing.join(", ")}. No changes made.`);
    for (const [source, target] of renames) console.log(`${source} -> ${target}`);
    if (!renames.length) console.log("All table names already match Prisma.");
    else if (!process.argv.includes("--apply")) {
      console.log(`Preview only: ${renames.length} case-only renames. Back up this server database and stop the backend, then run this script with --apply.`);
    } else {
      // One RENAME statement; no DROP, CREATE, or row modifications.
      await prisma.$executeRawUnsafe(`RENAME TABLE ${renames.map(([source, target]) => `${quote(source)} TO ${quote(target)}`).join(", ")}`);
      console.log(`Renamed ${renames.length} tables. Existing rows were preserved.`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
