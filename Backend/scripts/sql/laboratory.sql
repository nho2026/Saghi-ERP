-- CreateTable
CREATE TABLE `laboratory_Tests` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `specimen` VARCHAR(191) NOT NULL,
    `price` DECIMAL(18, 2) NOT NULL,
    `unit` VARCHAR(191) NULL,
    `referenceRange` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `laboratory_Tests_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_DailyQueue` (
    `day` VARCHAR(10) NOT NULL,
    `nextNumber` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`day`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_Orders` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(36) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `appointmentId` VARCHAR(191) NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `queueDay` VARCHAR(10) NOT NULL,
    `queueNumber` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'awaiting_payment',
    `notes` TEXT NULL,
    `createdByName` VARCHAR(191) NOT NULL,
    `collectedByName` VARCHAR(191) NULL,
    `completedByName` VARCHAR(191) NULL,
    `collectedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `laboratory_Orders_requestId_key`(`requestId`),
    UNIQUE INDEX `laboratory_Orders_invoiceId_key`(`invoiceId`),
    INDEX `laboratory_Orders_patientId_createdAt_idx`(`patientId`, `createdAt`),
    INDEX `laboratory_Orders_leadId_idx`(`leadId`),
    INDEX `laboratory_Orders_appointmentId_idx`(`appointmentId`),
    INDEX `laboratory_Orders_status_queueDay_queueNumber_idx`(`status`, `queueDay`, `queueNumber`),
    UNIQUE INDEX `laboratory_Orders_queueDay_queueNumber_key`(`queueDay`, `queueNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_OrderItems` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NULL,
    `testName` VARCHAR(191) NOT NULL,
    `specimen` VARCHAR(191) NOT NULL,
    `price` DECIMAL(18, 2) NOT NULL,
    `unit` VARCHAR(191) NULL,
    `referenceRange` VARCHAR(191) NULL,
    `result` TEXT NULL,
    `resultNotes` TEXT NULL,

    INDEX `laboratory_OrderItems_orderId_idx`(`orderId`),
    INDEX `laboratory_OrderItems_testId_idx`(`testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_PaymentReceipts` (
    `requestId` VARCHAR(36) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `laboratory_PaymentReceipts_paymentId_key`(`paymentId`),
    INDEX `laboratory_PaymentReceipts_orderId_idx`(`orderId`),
    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `laboratory_Orders` ADD CONSTRAINT `laboratory_Orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_Orders` ADD CONSTRAINT `laboratory_Orders_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_CrmLead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_Orders` ADD CONSTRAINT `laboratory_Orders_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `crm_Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_Orders` ADD CONSTRAINT `laboratory_Orders_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_BillingInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_OrderItems` ADD CONSTRAINT `laboratory_OrderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `laboratory_Orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_OrderItems` ADD CONSTRAINT `laboratory_OrderItems_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `laboratory_Tests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_PaymentReceipts` ADD CONSTRAINT `laboratory_PaymentReceipts_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `laboratory_Orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_PaymentReceipts` ADD CONSTRAINT `laboratory_PaymentReceipts_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `billing_BillingPayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
