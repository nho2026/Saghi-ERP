ALTER TABLE `hr_Department` ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'office';
UPDATE `hr_Department` d SET d.`type` = 'hospital'
WHERE EXISTS (SELECT 1 FROM `healthcare_HealthStaff` s WHERE s.`departmentId` = d.`id`)
   OR EXISTS (SELECT 1 FROM `crm_Appointment` a WHERE a.`departmentId` = d.`id`);
