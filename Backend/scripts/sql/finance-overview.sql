-- AlterTable
ALTER TABLE `finance_FinanceCashFlow` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` VARCHAR(191) NULL,
    ADD COLUMN `cashAccountId` VARCHAR(191) NULL,
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `sourceHash` VARCHAR(191) NULL,
    ADD COLUMN `sourceId` VARCHAR(191) NULL,
    ADD COLUMN `sourceType` VARCHAR(191) NULL,
    ADD COLUMN `sourceUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `finance_CashAccount` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `openingBalance` DECIMAL(18, 2) NOT NULL,
    `openingDate` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `finance_CashAccount_name_currency_key`(`name`, `currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_CashFlowAudit` (
    `id` VARCHAR(191) NOT NULL,
    `flowId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `finance_CashFlowAudit_flowId_createdAt_idx`(`flowId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `finance_FinanceCashFlow_cashAccountId_idx` ON `finance_FinanceCashFlow`(`cashAccountId`);

-- CreateIndex
CREATE UNIQUE INDEX `finance_FinanceCashFlow_sourceType_sourceId_key` ON `finance_FinanceCashFlow`(`sourceType`, `sourceId`);

-- AddForeignKey
ALTER TABLE `finance_FinanceCashFlow` ADD CONSTRAINT `finance_FinanceCashFlow_cashAccountId_fkey` FOREIGN KEY (`cashAccountId`) REFERENCES `finance_CashAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_CashFlowAudit` ADD CONSTRAINT `finance_CashFlowAudit_flowId_fkey` FOREIGN KEY (`flowId`) REFERENCES `finance_FinanceCashFlow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


-- Available to role administrators; assign only to expense reviewers.
INSERT INTO `access_Permission` (`id`, `key`, `name`, `module`, `description`, `createdAt`)
VALUES ('finance-expense-approval', 'finance.cash-flow.approve', 'Approve expenses', 'finance', 'Approve expenses created by another user.', CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
