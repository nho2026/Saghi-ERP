-- AlterTable
ALTER TABLE `tasks_Task` ADD COLUMN `projectId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `tasks_Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `departmentId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasks_Project_departmentId_status_idx`(`departmentId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Task_projectId_idx` ON `tasks_Task`(`projectId`);

-- AddForeignKey
ALTER TABLE `tasks_Task` ADD CONSTRAINT `tasks_Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `tasks_Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_Project` ADD CONSTRAINT `tasks_Project_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_Project` ADD CONSTRAINT `tasks_Project_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

