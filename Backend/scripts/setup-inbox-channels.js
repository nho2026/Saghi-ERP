import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
try {
  const columns = await prisma.$queryRaw`SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead_convarasations'`;
  if (!columns.length) throw new Error("Conversation table is missing.");
  const names = new Set(columns.map(({ name }) => name));
  if (!names.has("channel")) await prisma.$executeRawUnsafe("ALTER TABLE `crm_lead_convarasations` ADD COLUMN `channel` VARCHAR(191) NOT NULL DEFAULT 'whatsapp'");
  if (!names.has("isDemo")) await prisma.$executeRawUnsafe("ALTER TABLE `crm_lead_convarasations` ADD COLUMN `isDemo` BOOLEAN NOT NULL DEFAULT false");
  console.log("Inbox channel metadata ready.");
} finally { await prisma.$disconnect(); }
