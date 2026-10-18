import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";

const mappings = [
  { sources: ["crm_WhatsappConversation", "crm_whatsappconversation", "lead_inbox", "crm_lead_convarazation"], target: "crm_lead_convarasations" },
  { sources: ["crm_WhatsappMessage", "crm_whatsappmessage"], target: "crm_leadinbox" },
];

try {
  const tables = await prisma.$queryRaw`
    SELECT TABLE_NAME AS name FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
  `;
  const names = new Set(tables.map(({ name }) => name));
  const renames = [];
  const counts = new Map();
  for (const { sources, target } of mappings) {
    const found = sources.filter((name) => names.has(name));
    if (found.length > 1 || (found.length && names.has(target))) {
      throw new Error(`Conflicting tables for ${target}; no changes made.`);
    }
    const source = found[0] ?? (names.has(target) ? target : undefined);
    if (!source) throw new Error(`No source table for ${target}; no changes made.`);
    // All interpolated identifiers come from the fixed mappings above.
    const [row] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM \`${source}\``);
    counts.set(target, row.count);
    if (source !== target) renames.push(`\`${source}\` TO \`${target}\``);
  }
  if (renames.length) {
    // Rename both tables together, preserving existing rows and foreign keys.
    await prisma.$executeRawUnsafe(`RENAME TABLE ${renames.join(", ")}`);
  }
  for (const { target } of mappings) {
    const [row] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM \`${target}\``);
    if (row.count !== counts.get(target)) throw new Error(`Row count changed for ${target}; inspect concurrent writes.`);
    console.log(`${target}: ${row.count} rows verified.`);
  }
  console.log(renames.length ? "Lead inbox tables renamed successfully." : "Table names already up to date.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
