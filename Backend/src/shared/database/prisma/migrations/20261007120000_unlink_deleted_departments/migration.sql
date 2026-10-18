-- Preserve related records when a department is deleted by clearing their foreign keys.
ALTER TABLE `finance_FinanceCashFlow`
  DROP FOREIGN KEY `finance_FinanceCashFlow_departmentId_fkey`;
ALTER TABLE `finance_FinanceCashFlow`
  ADD CONSTRAINT `finance_FinanceCashFlow_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `tasks_Project`
  DROP FOREIGN KEY `tasks_Project_departmentId_fkey`;
ALTER TABLE `tasks_Project`
  MODIFY `departmentId` VARCHAR(191) NULL,
  ADD CONSTRAINT `tasks_Project_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `building_DepartmentProduct`
  DROP FOREIGN KEY `building_DepartmentProduct_departmentId_fkey`;
ALTER TABLE `building_DepartmentProduct`
  MODIFY `departmentId` VARCHAR(191) NULL,
  ADD CONSTRAINT `building_DepartmentProduct_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `building_Expense`
  DROP FOREIGN KEY `building_Expense_departmentId_fkey`;
ALTER TABLE `building_Expense`
  MODIFY `departmentId` VARCHAR(191) NULL,
  ADD CONSTRAINT `building_Expense_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `building_Request`
  DROP FOREIGN KEY `building_Request_departmentId_fkey`;
ALTER TABLE `building_Request`
  MODIFY `departmentId` VARCHAR(191) NULL,
  ADD CONSTRAINT `building_Request_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `meetings_Meeting`
  DROP FOREIGN KEY `Meeting_departmentId_fkey`;
ALTER TABLE `meetings_Meeting`
  MODIFY `departmentId` VARCHAR(191) NULL,
  ADD CONSTRAINT `Meeting_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `inventory_InventoryDepartmentOrder`
  DROP FOREIGN KEY `inventory_InventoryDepartmentOrder_departmentId_fkey`;
ALTER TABLE `inventory_InventoryDepartmentOrder`
  MODIFY `departmentId` VARCHAR(191) NULL,
  ADD CONSTRAINT `inventory_InventoryDepartmentOrder_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
