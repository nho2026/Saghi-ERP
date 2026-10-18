-- Apply once before deploying the team-based application.
-- Legacy leadership columns remain intact for audit/rollback purposes.
CREATE TABLE `hr_Team` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'active',
  `leaderId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Team_name_key` (`name`),
  INDEX `hr_Team_leaderId_idx` (`leaderId`),
  CONSTRAINT `hr_Team_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `hr_Employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `hr_Employees`
  ADD COLUMN `teamId` VARCHAR(191) NULL,
  ADD CONSTRAINT `hr_Employees_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `hr_Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Names are deliberately provisional: rename these teams in HR after migration.
INSERT INTO `hr_Team` (`id`, `name`, `description`, `leaderId`, `updatedAt`)
SELECT CONCAT('legacy-team-', e.id), CONCAT('Team ', e.employeeCode),
       'Migrated from employee reporting assignments', e.id, CURRENT_TIMESTAMP(3)
FROM `hr_Employees` e
WHERE e.isTeamLeader = true OR EXISTS (
  SELECT 1 FROM `hr_Employees` member WHERE member.teamLeaderId = e.id
);

UPDATE `hr_Employees` e JOIN `hr_Team` t ON t.leaderId = e.teamLeaderId
SET e.teamId = t.id;
UPDATE `hr_Employees` e JOIN `hr_Team` t ON t.leaderId = e.id
SET e.teamId = t.id WHERE e.teamId IS NULL;
