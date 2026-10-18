-- Stable system identifiers are not editable through the role API.
ALTER TABLE `access_Role` ADD COLUMN `code` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Role_code_key` ON `access_Role` (`code`);
-- One-time mapping of the existing role; runtime checks use code only.
UPDATE `access_Role` SET `code` = 'warehouse_staff' WHERE `name` = 'Warehouse Staff' AND `code` IS NULL;
