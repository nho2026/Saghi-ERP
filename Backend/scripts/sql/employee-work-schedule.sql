ALTER TABLE `hr_Employees`
  ADD COLUMN `scheduleType` VARCHAR(191) NOT NULL DEFAULT 'static',
  ADD COLUMN `workSchedule` JSON NULL;
