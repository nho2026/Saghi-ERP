import { prisma } from "../src/shared/database/client.js";

try {
  const columns = await prisma.$queryRaw`
    SELECT COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory_InventoryPurchase'
      AND COLUMN_NAME = 'hasInvoice'
  `;
  if (columns.length === 0) {
    await prisma.$executeRaw`ALTER TABLE inventory_InventoryPurchase ADD COLUMN hasInvoice BOOLEAN NOT NULL DEFAULT FALSE`;
    await prisma.$executeRaw`UPDATE inventory_InventoryPurchase SET hasInvoice = (attachmentUrl IS NOT NULL AND attachmentUrl <> '')`;
    console.log("Added purchase invoice availability and backfilled existing attachments.");
  } else {
    console.log("Purchase invoice availability column already exists.");
  }
} finally {
  await prisma.$disconnect();
}
