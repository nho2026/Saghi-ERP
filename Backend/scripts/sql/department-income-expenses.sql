-- Apply once before deploying department income and expense tracking.
-- Existing records retain their values and appear under Unassigned.
ALTER TABLE `finance_FinanceCashFlow`
  ADD COLUMN `departmentId` VARCHAR(191) NULL,
  MODIFY COLUMN `amount` DECIMAL(14,2) NOT NULL,
  ADD INDEX `finance_FinanceCashFlow_departmentId_flowDate_idx` (`departmentId`, `flowDate`),
  ADD CONSTRAINT `finance_FinanceCashFlow_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `hr_Department` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
