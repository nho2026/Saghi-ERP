-- AlterTable
ALTER TABLE `access_role` ADD COLUMN `code` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Role_code_key` ON `access_role`(`code`);
