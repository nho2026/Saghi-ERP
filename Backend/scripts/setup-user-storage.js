import 'dotenv/config';
import { prisma } from '../src/shared/database/client.js';
try {
  const columns = await prisma.$queryRaw`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'access_User' AND COLUMN_NAME = 'warehouseId'`;
  if (!columns.length) await prisma.$executeRawUnsafe('ALTER TABLE `access_User` ADD COLUMN `warehouseId` VARCHAR(191) NULL');
  const indexes = await prisma.$queryRaw`SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'access_User' AND INDEX_NAME = 'access_User_warehouseId_idx'`;
  if (!indexes.length) await prisma.$executeRawUnsafe('CREATE INDEX `access_User_warehouseId_idx` ON `access_User` (`warehouseId`)');
  const constraints = await prisma.$queryRaw`SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'access_User' AND CONSTRAINT_NAME = 'access_User_warehouseId_fkey'`;
  if (!constraints.length) await prisma.$executeRawUnsafe('ALTER TABLE `access_User` ADD CONSTRAINT `access_User_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_InventoryWarehouse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE');
  console.log('User storage assignment schema ready.');
} finally { await prisma.$disconnect(); }
