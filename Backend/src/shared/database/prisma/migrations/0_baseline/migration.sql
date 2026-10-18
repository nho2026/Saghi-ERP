-- CreateTable
CREATE TABLE `access_permission` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Permission_key_key`(`key` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_rolepermission` (
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,

    INDEX `role_permission_permissionId_fkey`(`permissionId` ASC),
    PRIMARY KEY (`roleId` ASC, `permissionId` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_user` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `pinHash` VARCHAR(191) NULL,
    `pinLookup` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `warehouseId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email` ASC),
    UNIQUE INDEX `User_pinLookup_key`(`pinLookup` ASC),
    UNIQUE INDEX `User_username_key`(`username` ASC),
    INDEX `access_User_warehouseId_idx`(`warehouseId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_userrole` (
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,

    INDEX `UserRole_roleId_fkey`(`roleId` ASC),
    PRIMARY KEY (`userId` ASC, `roleId` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_accountingaccount` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AccountingAccount_code_key`(`code` ASC),
    INDEX `AccountingAccount_parentId_idx`(`parentId` ASC),
    INDEX `AccountingAccount_type_idx`(`type` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_journalentry` (
    `id` VARCHAR(191) NOT NULL,
    `entryNumber` VARCHAR(191) NOT NULL,
    `entryDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JournalEntry_entryDate_idx`(`entryDate` ASC),
    UNIQUE INDEX `JournalEntry_entryNumber_key`(`entryNumber` ASC),
    INDEX `JournalEntry_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_journalline` (
    `id` VARCHAR(191) NOT NULL,
    `entryId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `debit` DOUBLE NOT NULL DEFAULT 0,
    `credit` DOUBLE NOT NULL DEFAULT 0,

    INDEX `JournalLine_accountId_idx`(`accountId` ASC),
    INDEX `JournalLine_entryId_idx`(`entryId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_attendancedevice` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL DEFAULT 'DS-K1T342MFWX-E1',
    `ipAddress` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 80,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'offline',
    `lastSeenAt` DATETIME(3) NULL,
    `eventsClearedAt` DATETIME(3) NULL,
    `workingDaysPerMonth` INTEGER NOT NULL DEFAULT 22,
    `checkInTime` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `checkOutTime` VARCHAR(191) NOT NULL DEFAULT '17:00',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AttendanceDevice_ipAddress_port_key`(`ipAddress` ASC, `port` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_attendanceevent` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `employeeNo` VARCHAR(191) NOT NULL,
    `personName` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `verification` VARCHAR(191) NULL,
    `deviceEventId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `personId` VARCHAR(191) NULL,

    UNIQUE INDEX `AttendanceEvent_deviceId_deviceEventId_key`(`deviceId` ASC, `deviceEventId` ASC),
    INDEX `AttendanceEvent_employeeNo_idx`(`employeeNo` ASC),
    INDEX `AttendanceEvent_occurredAt_idx`(`occurredAt` ASC),
    INDEX `AttendanceEvent_personId_fkey`(`personId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_attendanceperson` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NULL,
    `employeeNo` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cardNo` VARCHAR(191) NULL,
    `hasFingerprint` BOOLEAN NOT NULL DEFAULT false,
    `hasFace` BOOLEAN NOT NULL DEFAULT false,
    `hasPassword` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AttendancePerson_deviceId_employeeNo_key`(`deviceId` ASC, `employeeNo` ASC),
    INDEX `AttendancePerson_employeeId_idx`(`employeeId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_loginattempt` (
    `id` VARCHAR(64) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `auth_LoginAttempt_expiresAt_idx`(`expiresAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_billingcustomer` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `taxNumber` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingCustomer_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_billinginvoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `subtotal` DOUBLE NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NOT NULL,
    `paidAmount` DOUBLE NOT NULL DEFAULT 0,
    `balanceAmount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BillingInvoice_customerId_idx`(`customerId` ASC),
    UNIQUE INDEX `BillingInvoice_invoiceNumber_key`(`invoiceNumber` ASC),
    INDEX `BillingInvoice_issueDate_idx`(`issueDate` ASC),
    INDEX `BillingInvoice_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_billinginvoiceitem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `lineTotal` DOUBLE NOT NULL,

    INDEX `BillingInvoiceItem_invoiceId_idx`(`invoiceId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_billingpayment` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BillingPayment_invoiceId_idx`(`invoiceId` ASC),
    INDEX `BillingPayment_paidAt_idx`(`paidAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_serviceadvance` (
    `id` VARCHAR(191) NOT NULL,
    `receiptNumber` VARCHAR(191) NOT NULL,
    `patientName` VARCHAR(191) NOT NULL,
    `patientPhone` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,
    `appointmentId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `appliedAmount` DOUBLE NOT NULL DEFAULT 0,
    `balanceAmount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `method` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ServiceAdvance_appointmentId_idx`(`appointmentId` ASC),
    INDEX `ServiceAdvance_departmentId_idx`(`departmentId` ASC),
    UNIQUE INDEX `ServiceAdvance_receiptNumber_key`(`receiptNumber` ASC),
    INDEX `ServiceAdvance_receivedAt_idx`(`receivedAt` ASC),
    INDEX `ServiceAdvance_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_appointment` (
    `id` VARCHAR(191) NOT NULL,
    `patientName` VARCHAR(191) NOT NULL,
    `patientPhone` VARCHAR(191) NOT NULL,
    `patientEmail` VARCHAR(191) NULL,
    `doctorId` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 30,
    `reason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `source` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Appointment_departmentId_idx`(`departmentId` ASC),
    INDEX `Appointment_doctorId_scheduledAt_idx`(`doctorId` ASC, `scheduledAt` ASC),
    INDEX `Appointment_scheduledAt_idx`(`scheduledAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_crmformtemplate` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'clinical',
    `fields` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CrmFormTemplate_category_status_idx`(`category` ASC, `status` ASC),
    UNIQUE INDEX `CrmFormTemplate_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_crmlead` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,
    `interest` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `convertedPatientId` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `code` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `competitorsNote` TEXT NULL,
    `contactMethod` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `leadSourceChannel` VARCHAR(191) NULL,
    `maritalStatus` VARCHAR(191) NULL,
    `patientType` VARCHAR(191) NULL,
    `preferredLanguage` VARCHAR(191) NULL,
    `satisfactionScore` INTEGER NULL DEFAULT 0,
    `secondaryPhone` VARCHAR(191) NULL,
    `referralAddress` VARCHAR(191) NULL,
    `referralName` VARCHAR(191) NULL,
    `referralNote` TEXT NULL,
    `referralPersona` VARCHAR(191) NULL,
    `referralPhone` VARCHAR(191) NULL,
    `budgetRange` VARCHAR(191) NULL,
    `decisionInfluencers` TEXT NULL,
    `knowledgeRating` INTEGER NULL,
    `painPoints` TEXT NULL,
    `whatsappPhone` VARCHAR(191) NULL,

    UNIQUE INDEX `CrmLead_code_key`(`code` ASC),
    INDEX `CrmLead_convertedPatientId_fkey`(`convertedPatientId` ASC),
    INDEX `CrmLead_phone_idx`(`phone` ASC),
    INDEX `CrmLead_status_createdAt_idx`(`status` ASC, `createdAt` ASC),
    UNIQUE INDEX `CrmLead_whatsappPhone_key`(`whatsappPhone` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_crmleadattachment` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `fileSize` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CrmLeadAttachment_leadId_createdAt_idx`(`leadId` ASC, `createdAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_crmleadstatushistory` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `fromStatus` VARCHAR(191) NULL,
    `toStatus` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CrmLeadStatusHistory_leadId_createdAt_idx`(`leadId` ASC, `createdAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_feedback` (
    `id` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `source` VARCHAR(191) NOT NULL DEFAULT 'website',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Feedback_createdAt_idx`(`createdAt` ASC),
    INDEX `Feedback_productId_idx`(`productId` ASC),
    INDEX `Feedback_serviceId_idx`(`serviceId` ASC),
    INDEX `Feedback_targetType_status_idx`(`targetType` ASC, `status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_lead_convarasations` (
    `channel` VARCHAR(191) NOT NULL DEFAULT 'whatsapp',
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `profileName` VARCHAR(191) NULL,
    `leadId` VARCHAR(191) NULL,
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CrmWhatsappConversation_lastMessageAt_idx`(`lastMessageAt` ASC),
    INDEX `CrmWhatsappConversation_leadId_idx`(`leadId` ASC),
    UNIQUE INDEX `CrmWhatsappConversation_phone_key`(`phone` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crm_leadinbox` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `messageType` VARCHAR(191) NOT NULL DEFAULT 'text',
    `body` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'received',
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rawPayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CrmWhatsappMessage_conversationId_sentAt_idx`(`conversationId` ASC, `sentAt` ASC),
    UNIQUE INDEX `CrmWhatsappMessage_externalId_key`(`externalId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_cashaccount` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `openingBalance` DECIMAL(18, 2) NOT NULL,
    `openingDate` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `finance_CashAccount_name_currency_key`(`name` ASC, `currency` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_cashflowaudit` (
    `id` VARCHAR(191) NOT NULL,
    `flowId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `finance_CashFlowAudit_flowId_createdAt_idx`(`flowId` ASC, `createdAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_financebudget` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fiscalYear` INTEGER NOT NULL,
    `department` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `plannedAmount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinanceBudget_fiscalYear_idx`(`fiscalYear` ASC),
    INDEX `FinanceBudget_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_financecashflow` (
    `id` VARCHAR(191) NOT NULL,
    `flowDate` DATETIME(3) NOT NULL,
    `flowType` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'planned',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `cashAccountId` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `sourceHash` VARCHAR(191) NULL,
    `sourceId` VARCHAR(191) NULL,
    `sourceType` VARCHAR(191) NULL,
    `sourceUrl` VARCHAR(191) NULL,

    INDEX `FinanceCashFlow_flowDate_idx`(`flowDate` ASC),
    INDEX `FinanceCashFlow_flowType_idx`(`flowType` ASC),
    INDEX `finance_FinanceCashFlow_cashAccountId_idx`(`cashAccountId` ASC),
    INDEX `finance_FinanceCashFlow_departmentId_flowDate_idx`(`departmentId` ASC, `flowDate` ASC),
    UNIQUE INDEX `finance_FinanceCashFlow_sourceType_sourceId_key`(`sourceType` ASC, `sourceId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_financeforecast` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `scenario` VARCHAR(191) NOT NULL DEFAULT 'base',
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `projectedRevenue` DOUBLE NOT NULL,
    `projectedExpense` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinanceForecast_periodStart_periodEnd_idx`(`periodStart` ASC, `periodEnd` ASC),
    INDEX `FinanceForecast_scenario_idx`(`scenario` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_financefunding` (
    `id` VARCHAR(191) NOT NULL,
    `sourceName` VARCHAR(191) NOT NULL,
    `fundingType` VARCHAR(191) NOT NULL,
    `committedAmount` DOUBLE NOT NULL,
    `receivedAmount` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `interestRate` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'planned',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinanceFunding_startDate_idx`(`startDate` ASC),
    INDEX `FinanceFunding_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_doctorspecialization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `healthcare_DoctorSpecialization_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_healthcareservice` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HealthcareService_code_key`(`code` ASC),
    INDEX `HealthcareService_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_healthstaff` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `staffType` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NULL,
    `licenseNumber` VARCHAR(191) NULL,
    `biography` TEXT NULL,
    `publicBookingEnabled` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HealthStaff_departmentId_idx`(`departmentId` ASC),
    UNIQUE INDEX `HealthStaff_employeeId_key`(`employeeId` ASC),
    UNIQUE INDEX `HealthStaff_licenseNumber_key`(`licenseNumber` ASC),
    INDEX `HealthStaff_staffType_idx`(`staffType` ASC),
    INDEX `healthcare_HealthStaff_specialization_fkey`(`specialization` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_patient` (
    `id` VARCHAR(191) NOT NULL,
    `patientCode` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `bloodType` VARCHAR(191) NULL,
    `allergies` TEXT NULL,
    `medicalNotes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `childrenCount` INTEGER NOT NULL DEFAULT 0,
    `hasDiabetes` BOOLEAN NOT NULL DEFAULT false,
    `hasHypertension` BOOLEAN NOT NULL DEFAULT false,
    `heightCm` DOUBLE NULL,
    `isMarried` BOOLEAN NOT NULL DEFAULT false,
    `weightKg` DOUBLE NULL,
    `followUpDate` DATETIME(3) NULL,

    UNIQUE INDEX `Patient_patientCode_key`(`patientCode` ASC),
    INDEX `Patient_phone_idx`(`phone` ASC),
    INDEX `Patient_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_patientformsubmission` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `formTemplateId` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `submittedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PatientFormSubmission_formTemplateId_idx`(`formTemplateId` ASC),
    INDEX `PatientFormSubmission_patientId_createdAt_idx`(`patientId` ASC, `createdAt` ASC),
    INDEX `healthcare_PatientFormSubmission_submittedById_idx`(`submittedById` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_patientpayment` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `surgeryAppointmentId` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'paid',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PatientPayment_patientId_paidAt_idx`(`patientId` ASC, `paidAt` ASC),
    INDEX `PatientPayment_surgeryAppointmentId_idx`(`surgeryAppointmentId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_patientprescription` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `prescriberId` VARCHAR(191) NOT NULL,
    `patientName` VARCHAR(191) NOT NULL,
    `patientCode` VARCHAR(191) NOT NULL,
    `prescriberName` VARCHAR(191) NOT NULL,
    `notes` TEXT NOT NULL,
    `items` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `healthcare_PatientPrescription_patientId_createdAt_idx`(`patientId` ASC, `createdAt` ASC),
    INDEX `healthcare_PatientPrescription_prescriberId_idx`(`prescriberId` ASC),
    UNIQUE INDEX `healthcare_PatientPrescription_requestId_key`(`requestId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_patientreferral` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `referrerName` VARCHAR(191) NOT NULL,
    `referrerPhone` VARCHAR(191) NULL,
    `referralType` VARCHAR(191) NOT NULL DEFAULT 'patient',
    `referredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `direction` VARCHAR(191) NOT NULL DEFAULT 'inbound',
    `referralPersona` VARCHAR(191) NULL,
    `referrerAddress` VARCHAR(191) NULL,
    `referrerProfession` VARCHAR(191) NULL,
    `referringPatientName` VARCHAR(191) NULL,

    INDEX `PatientReferral_patientId_referredAt_idx`(`patientId` ASC, `referredAt` ASC),
    INDEX `PatientReferral_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_surgery` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `basePrice` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Surgery_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healthcare_surgeryappointment` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NULL,
    `surgeryId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `operatingRoom` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',
    `preOpNotes` TEXT NULL,
    `postOpNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SurgeryAppointment_doctorId_idx`(`doctorId` ASC),
    INDEX `SurgeryAppointment_patientId_idx`(`patientId` ASC),
    INDEX `SurgeryAppointment_scheduledAt_status_idx`(`scheduledAt` ASC, `status` ASC),
    INDEX `SurgeryAppointment_surgeryId_fkey`(`surgeryId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_attendancepermission` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `permissionType` VARCHAR(191) NOT NULL,
    `fromDate` DATETIME(3) NOT NULL,
    `toDate` DATETIME(3) NOT NULL,
    `permittedMinutes` INTEGER NULL,
    `reason` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'approved',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `leaveType` VARCHAR(191) NULL,

    INDEX `AttendancePermission_employeeId_fromDate_toDate_idx`(`employeeId` ASC, `fromDate` ASC, `toDate` ASC),
    INDEX `AttendancePermission_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_department` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `managerId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'office',

    UNIQUE INDEX `Department_code_key`(`code` ASC),
    INDEX `Department_managerId_idx`(`managerId` ASC),
    UNIQUE INDEX `Department_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_employeeattendance` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `attendanceDate` DATETIME(3) NOT NULL,
    `checkIn` DATETIME(3) NULL,
    `checkOut` DATETIME(3) NULL,
    `workedMinutes` INTEGER NOT NULL DEFAULT 0,
    `lateMinutes` INTEGER NOT NULL DEFAULT 0,
    `earlyLeaveMinutes` INTEGER NOT NULL DEFAULT 0,
    `overtimeMinutes` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'present',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmployeeAttendance_attendanceDate_idx`(`attendanceDate` ASC),
    UNIQUE INDEX `EmployeeAttendance_employeeId_attendanceDate_key`(`employeeId` ASC, `attendanceDate` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_employeeidea` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmployeeIdea_userId_createdAt_idx`(`userId` ASC, `createdAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_employees` (
    `id` VARCHAR(191) NOT NULL,
    `employeeCode` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `positionId` VARCHAR(191) NULL,
    `hireDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `checkInTime` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `checkOutTime` VARCHAR(191) NOT NULL DEFAULT '17:00',
    `isTeamLeader` BOOLEAN NOT NULL DEFAULT false,
    `teamLeaderId` VARCHAR(191) NULL,
    `scheduleType` VARCHAR(191) NOT NULL DEFAULT 'static',
    `workSchedule` JSON NULL,
    `teamId` VARCHAR(191) NULL,

    INDEX `Employee_departmentId_idx`(`departmentId` ASC),
    UNIQUE INDEX `Employee_employeeCode_key`(`employeeCode` ASC),
    INDEX `Employee_positionId_idx`(`positionId` ASC),
    INDEX `Employee_teamLeaderId_idx`(`teamLeaderId` ASC),
    UNIQUE INDEX `Employee_userId_key`(`userId` ASC),
    INDEX `hr_Employees_teamId_fkey`(`teamId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_employeesalary` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `baseSalary` DOUBLE NOT NULL,
    `currencyId` VARCHAR(191) NOT NULL,
    `payType` VARCHAR(191) NOT NULL,
    `effectiveFrom` DATETIME(3) NOT NULL,
    `effectiveTo` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmployeeSalary_employeeId_idx`(`employeeId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_employeetarget` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `metric` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `targetValue` DOUBLE NOT NULL,
    `currentValue` DOUBLE NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `employeeId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmployeeTarget_createdById_idx`(`createdById` ASC),
    INDEX `EmployeeTarget_dueDate_idx`(`dueDate` ASC),
    INDEX `EmployeeTarget_employeeId_status_idx`(`employeeId` ASC, `status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_payroll` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `salaryId` VARCHAR(191) NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `baseSalary` DOUBLE NOT NULL,
    `overtimeAmount` DOUBLE NOT NULL DEFAULT 0,
    `bonusAmount` DOUBLE NOT NULL DEFAULT 0,
    `allowanceAmount` DOUBLE NOT NULL DEFAULT 0,
    `lateDeduction` DOUBLE NOT NULL DEFAULT 0,
    `absenceDeduction` DOUBLE NOT NULL DEFAULT 0,
    `otherDeduction` DOUBLE NOT NULL DEFAULT 0,
    `grossSalary` DOUBLE NOT NULL,
    `totalDeduction` DOUBLE NOT NULL,
    `netSalary` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payroll_employeeId_year_month_key`(`employeeId` ASC, `year` ASC, `month` ASC),
    INDEX `Payroll_salaryId_idx`(`salaryId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_payrolladjustment` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceId` VARCHAR(191) NULL,
    `sourceType` VARCHAR(191) NULL,

    INDEX `PayrollAdjustment_appliedAt_idx`(`appliedAt` ASC),
    INDEX `PayrollAdjustment_employeeId_year_month_idx`(`employeeId` ASC, `year` ASC, `month` ASC),
    UNIQUE INDEX `PayrollAdjustment_sourceType_sourceId_key`(`sourceType` ASC, `sourceId` ASC),
    INDEX `PayrollAdjustment_year_month_type_idx`(`year` ASC, `month` ASC, `type` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_position` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Position_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_salaryadvance` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `requestedAt` DATETIME(3) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `deductionStartDate` DATETIME(3) NULL,
    `installments` INTEGER NOT NULL DEFAULT 1,
    `deductedAmount` DOUBLE NOT NULL DEFAULT 0,
    `remainingAmount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'requested',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SalaryAdvance_employeeId_idx`(`employeeId` ASC),
    INDEX `SalaryAdvance_requestedAt_idx`(`requestedAt` ASC),
    INDEX `SalaryAdvance_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_team` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `leaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Team_name_key`(`name` ASC),
    INDEX `hr_Team_leaderId_idx`(`leaderId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_warning` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'warning',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Warning_createdAt_idx`(`createdAt` ASC),
    INDEX `Warning_senderId_fkey`(`senderId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_warningrecipient` (
    `warningId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NULL,

    INDEX `WarningRecipient_userId_readAt_idx`(`userId` ASC, `readAt` ASC),
    PRIMARY KEY (`warningId` ASC, `userId` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorydepartmentorder` (
    `id` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `departmentName` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `deadline` DATETIME(3) NULL,
    `note` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `items` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `price` DECIMAL(18, 2) NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_InventoryDepartmentOrder_departmentId_createdAt_idx`(`departmentId` ASC, `createdAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorydepartmentordercomment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `note` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_InventoryDepartmentOrderComment_orderId_idx`(`orderId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorymovement` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `movementType` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventoryMovement_occurredAt_idx`(`occurredAt` ASC),
    INDEX `InventoryMovement_productId_idx`(`productId` ASC),
    INDEX `InventoryMovement_warehouseId_idx`(`warehouseId` ASC),
    INDEX `inventory_InventoryMovement_movementType_occurredAt_id_idx`(`movementType` ASC, `occurredAt` ASC, `id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventoryorder` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `items` JSON NOT NULL,
    `totalPrice` DECIMAL(18, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inventory_InventoryOrder_requestId_key`(`requestId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventoryproduct` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'item',
    `costPrice` DOUBLE NOT NULL,
    `sellingPrice` DOUBLE NOT NULL,
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `discountStart` DATETIME(3) NULL,
    `discountEnd` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isSpecial` BOOLEAN NOT NULL DEFAULT false,
    `size` VARCHAR(191) NULL,
    `boxPrice` DOUBLE NOT NULL DEFAULT 0,
    `specialProfitRate` DOUBLE NOT NULL DEFAULT 0,
    `specialPrice` DOUBLE NOT NULL DEFAULT 0,
    `productType` VARCHAR(191) NOT NULL DEFAULT 'patient_use',
    `productionCompany` VARCHAR(191) NULL,
    `expiryDate` DATE NULL,
    `doseMgKgDay` DOUBLE NULL,
    `dosesPerDay` DOUBLE NULL,
    `concentrationMg` DOUBLE NULL,
    `concentrationMl` DOUBLE NULL,

    UNIQUE INDEX `InventoryProduct_barcode_key`(`barcode` ASC),
    INDEX `InventoryProduct_brandId_idx`(`brandId` ASC),
    INDEX `InventoryProduct_categoryId_idx`(`categoryId` ASC),
    UNIQUE INDEX `InventoryProduct_sku_key`(`sku` ASC),
    INDEX `InventoryProduct_status_idx`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventoryproductimage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `products_images_productId_sortOrder_idx`(`productId` ASC, `sortOrder` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorypurchase` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `buyDate` DATETIME(3) NOT NULL,
    `retailer` VARCHAR(191) NOT NULL,
    `salesperson` VARCHAR(191) NULL,
    `isDebt` BOOLEAN NOT NULL DEFAULT false,
    `note` TEXT NULL,
    `attachmentUrl` VARCHAR(191) NULL,
    `totalPrice` DECIMAL(18, 2) NOT NULL,
    `items` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `paidAmount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `hasInvoice` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `inventory_InventoryPurchase_requestId_key`(`requestId` ASC),
    UNIQUE INDEX `inventory_InventoryPurchase_retailer_invoiceNumber_key`(`retailer` ASC, `invoiceNumber` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorypurchasepayment` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` TEXT NULL,

    INDEX `inventory_InventoryPurchasePayment_purchaseId_idx`(`purchaseId` ASC),
    UNIQUE INDEX `inventory_InventoryPurchasePayment_requestId_key`(`requestId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorystock` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `reorderLevel` DOUBLE NOT NULL DEFAULT 0,
    `anesthesiaMinimum` DOUBLE NOT NULL DEFAULT 0,
    `scrubNurseMinimum` DOUBLE NOT NULL DEFAULT 0,
    `perfusionMinimum` DOUBLE NOT NULL DEFAULT 0,
    `cardiologyMinimum` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `InventoryStock_productId_warehouseId_key`(`productId` ASC, `warehouseId` ASC),
    INDEX `InventoryStock_warehouseId_idx`(`warehouseId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_inventorywarehouse` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InventoryWarehouse_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_productbrand` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_brands_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_productcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductCategory_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventorycustomer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(500) NOT NULL DEFAULT '',
    `note` TEXT NULL,
    `debtThreshold` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventoryicucase` (
    `id` VARCHAR(191) NOT NULL,
    `patientName` VARCHAR(191) NOT NULL,
    `entry` DATETIME(3) NOT NULL,
    `exit` DATETIME(3) NULL,
    `items` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `patientId` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'icu',
    `isBypass` BOOLEAN NOT NULL DEFAULT false,

    INDEX `InventoryIcuCase_patientId_idx`(`patientId` ASC),
    INDEX `InventoryIcuCase_unit_entry_id_idx`(`unit` ASC, `entry` ASC, `id` ASC),
    INDEX `InventoryIcuCase_unit_idx`(`unit` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventoryproductioncompany` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InventoryProductionCompany_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventoryretailer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InventoryRetailer_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_dailyqueue` (
    `day` VARCHAR(10) NOT NULL,
    `nextNumber` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`day` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_orderitems` (
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

    INDEX `laboratory_OrderItems_orderId_idx`(`orderId` ASC),
    INDEX `laboratory_OrderItems_testId_idx`(`testId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_orders` (
    `accountingCalledAt` DATETIME(3) NULL,
    `accountingCalledByName` VARCHAR(191) NULL,
    `receivedAt` DATETIME(3) NULL,
    `contactedAt` DATETIME(3) NULL,
    `contactedByName` VARCHAR(191) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `deliveredByName` VARCHAR(191) NULL,
    `attachments` JSON NULL,
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

    INDEX `laboratory_Orders_appointmentId_idx`(`appointmentId` ASC),
    UNIQUE INDEX `laboratory_Orders_invoiceId_key`(`invoiceId` ASC),
    INDEX `laboratory_Orders_leadId_idx`(`leadId` ASC),
    INDEX `laboratory_Orders_patientId_createdAt_idx`(`patientId` ASC, `createdAt` ASC),
    UNIQUE INDEX `laboratory_Orders_queueDay_queueNumber_key`(`queueDay` ASC, `queueNumber` ASC),
    UNIQUE INDEX `laboratory_Orders_requestId_key`(`requestId` ASC),
    INDEX `laboratory_Orders_status_queueDay_queueNumber_idx`(`status` ASC, `queueDay` ASC, `queueNumber` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_paymentreceipts` (
    `requestId` VARCHAR(36) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `laboratory_PaymentReceipts_orderId_idx`(`orderId` ASC),
    UNIQUE INDEX `laboratory_PaymentReceipts_paymentId_key`(`paymentId` ASC),
    PRIMARY KEY (`requestId` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_tests` (
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

    UNIQUE INDEX `laboratory_Tests_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings_meeting` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `roomCode` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,

    INDEX `Meeting_creatorId_idx`(`creatorId` ASC),
    INDEX `Meeting_departmentId_status_idx`(`departmentId` ASC, `status` ASC),
    UNIQUE INDEX `Meeting_roomCode_key`(`roomCode` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings_meetingparticipant` (
    `id` VARCHAR(191) NOT NULL,
    `meetingId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,

    INDEX `MeetingParticipant_meetingId_idx`(`meetingId` ASC),
    INDEX `MeetingParticipant_userId_idx`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_possale` (
    `id` VARCHAR(191) NOT NULL,
    `saleNumber` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NOT NULL,
    `paidAmount` DOUBLE NOT NULL,
    `changeAmount` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `cashierName` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `soldAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PosSale_saleNumber_key`(`saleNumber` ASC),
    INDEX `PosSale_soldAt_idx`(`soldAt` ASC),
    INDEX `PosSale_status_idx`(`status` ASC),
    INDEX `PosSale_warehouseId_fkey`(`warehouseId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_possaleitem` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `lineTotal` DOUBLE NOT NULL,

    INDEX `PosSaleItem_productId_idx`(`productId` ASC),
    INDEX `PosSaleItem_saleId_idx`(`saleId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_auditlog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NULL,
    `method` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `statusCode` INTEGER NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `durationMs` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `details` JSON NULL,

    INDEX `AuditLog_action_createdAt_idx`(`action` ASC, `createdAt` ASC),
    INDEX `AuditLog_createdAt_idx`(`createdAt` ASC),
    INDEX `AuditLog_module_createdAt_idx`(`module` ASC, `createdAt` ASC),
    INDEX `AuditLog_statusCode_createdAt_idx`(`statusCode` ASC, `createdAt` ASC),
    INDEX `AuditLog_userId_createdAt_idx`(`userId` ASC, `createdAt` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `warningId` VARCHAR(191) NULL,
    `meetingId` VARCHAR(191) NULL,
    `crmLeadId` VARCHAR(191) NULL,
    `reminderKey` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `body` TEXT NULL,
    `route` VARCHAR(191) NULL,

    INDEX `Notification_crmLeadId_idx`(`crmLeadId` ASC),
    INDEX `Notification_meetingId_idx`(`meetingId` ASC),
    INDEX `Notification_taskId_idx`(`taskId` ASC),
    INDEX `Notification_userId_readAt_createdAt_idx`(`userId` ASC, `readAt` ASC, `createdAt` ASC),
    INDEX `Notification_warningId_idx`(`warningId` ASC),
    UNIQUE INDEX `system_Notification_reminderKey_key`(`reminderKey` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `category` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`category` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `departmentId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasks_Project_createdById_fkey`(`createdById` ASC),
    INDEX `tasks_Project_departmentId_status_idx`(`departmentId` ASC, `status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_task` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `team` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `status` VARCHAR(191) NOT NULL DEFAULT 'todo',
    `startDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `estimatedMinutes` INTEGER NULL,
    `completedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reviewNote` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `projectId` VARCHAR(191) NULL,

    INDEX `Task_createdById_fkey`(`createdById` ASC),
    INDEX `Task_dueDate_idx`(`dueDate` ASC),
    INDEX `Task_projectId_idx`(`projectId` ASC),
    INDEX `Task_reviewedById_fkey`(`reviewedById` ASC),
    INDEX `Task_status_idx`(`status` ASC),
    INDEX `Task_team_idx`(`team` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_taskassignee` (
    `taskId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TaskAssignee_employeeId_idx`(`employeeId` ASC),
    PRIMARY KEY (`taskId` ASC, `employeeId` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_taskattachment` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TaskAttachment_taskId_idx`(`taskId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_taskcomment` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TaskComment_authorId_fkey`(`authorId` ASC),
    INDEX `TaskComment_taskId_idx`(`taskId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_tasktimeentry` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `workDate` DATETIME(3) NOT NULL,
    `minutes` INTEGER NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TaskTimeEntry_employeeId_workDate_idx`(`employeeId` ASC, `workDate` ASC),
    INDEX `TaskTimeEntry_recordedById_fkey`(`recordedById` ASC),
    INDEX `TaskTimeEntry_taskId_idx`(`taskId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `access_rolepermission` ADD CONSTRAINT `role_permission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `access_permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_rolepermission` ADD CONSTRAINT `role_permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `access_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_user` ADD CONSTRAINT `access_User_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_userrole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `access_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_userrole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_accountingaccount` ADD CONSTRAINT `AccountingAccount_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `accounting_accountingaccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_journalline` ADD CONSTRAINT `JournalLine_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounting_accountingaccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_journalline` ADD CONSTRAINT `JournalLine_entryId_fkey` FOREIGN KEY (`entryId`) REFERENCES `accounting_journalentry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_attendanceevent` ADD CONSTRAINT `AttendanceEvent_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `attendance_attendancedevice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_attendanceevent` ADD CONSTRAINT `AttendanceEvent_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `attendance_attendanceperson`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_attendanceperson` ADD CONSTRAINT `AttendancePerson_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `attendance_attendancedevice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_attendanceperson` ADD CONSTRAINT `AttendancePerson_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billing_billinginvoice` ADD CONSTRAINT `BillingInvoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `billing_billingcustomer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billing_billinginvoiceitem` ADD CONSTRAINT `BillingInvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_billinginvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billing_billingpayment` ADD CONSTRAINT `BillingPayment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_billinginvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billing_serviceadvance` ADD CONSTRAINT `ServiceAdvance_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `crm_appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billing_serviceadvance` ADD CONSTRAINT `ServiceAdvance_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_appointment` ADD CONSTRAINT `Appointment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_appointment` ADD CONSTRAINT `crm_Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `healthcare_healthstaff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_crmlead` ADD CONSTRAINT `CrmLead_convertedPatientId_fkey` FOREIGN KEY (`convertedPatientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_crmleadattachment` ADD CONSTRAINT `CrmLeadAttachment_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_crmleadstatushistory` ADD CONSTRAINT `CrmLeadStatusHistory_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_feedback` ADD CONSTRAINT `Feedback_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_feedback` ADD CONSTRAINT `Feedback_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `healthcare_healthcareservice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_lead_convarasations` ADD CONSTRAINT `CrmWhatsappConversation_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crm_leadinbox` ADD CONSTRAINT `CrmWhatsappMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `crm_lead_convarasations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_cashflowaudit` ADD CONSTRAINT `finance_CashFlowAudit_flowId_fkey` FOREIGN KEY (`flowId`) REFERENCES `finance_financecashflow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_financecashflow` ADD CONSTRAINT `finance_FinanceCashFlow_cashAccountId_fkey` FOREIGN KEY (`cashAccountId`) REFERENCES `finance_cashaccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_financecashflow` ADD CONSTRAINT `finance_FinanceCashFlow_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_healthstaff` ADD CONSTRAINT `HealthStaff_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_healthstaff` ADD CONSTRAINT `HealthStaff_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_healthstaff` ADD CONSTRAINT `healthcare_HealthStaff_specialization_fkey` FOREIGN KEY (`specialization`) REFERENCES `healthcare_doctorspecialization`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientformsubmission` ADD CONSTRAINT `PatientFormSubmission_formTemplateId_fkey` FOREIGN KEY (`formTemplateId`) REFERENCES `crm_crmformtemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientformsubmission` ADD CONSTRAINT `PatientFormSubmission_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientformsubmission` ADD CONSTRAINT `healthcare_PatientFormSubmission_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `access_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientpayment` ADD CONSTRAINT `PatientPayment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientpayment` ADD CONSTRAINT `PatientPayment_surgeryAppointmentId_fkey` FOREIGN KEY (`surgeryAppointmentId`) REFERENCES `healthcare_surgeryappointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientprescription` ADD CONSTRAINT `healthcare_PatientPrescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientprescription` ADD CONSTRAINT `healthcare_PatientPrescription_prescriberId_fkey` FOREIGN KEY (`prescriberId`) REFERENCES `access_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_patientreferral` ADD CONSTRAINT `PatientReferral_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_surgeryappointment` ADD CONSTRAINT `SurgeryAppointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_surgeryappointment` ADD CONSTRAINT `SurgeryAppointment_surgeryId_fkey` FOREIGN KEY (`surgeryId`) REFERENCES `healthcare_surgery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healthcare_surgeryappointment` ADD CONSTRAINT `healthcare_SurgeryAppointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `healthcare_healthstaff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_attendancepermission` ADD CONSTRAINT `AttendancePermission_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_department` ADD CONSTRAINT `Department_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `hr_employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employeeattendance` ADD CONSTRAINT `EmployeeAttendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employeeidea` ADD CONSTRAINT `EmployeeIdea_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employees` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employees` ADD CONSTRAINT `Employee_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `hr_position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employees` ADD CONSTRAINT `Employee_teamLeaderId_fkey` FOREIGN KEY (`teamLeaderId`) REFERENCES `hr_employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employees` ADD CONSTRAINT `Employee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employees` ADD CONSTRAINT `hr_Employees_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `hr_team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employeesalary` ADD CONSTRAINT `EmployeeSalary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employeetarget` ADD CONSTRAINT `EmployeeTarget_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_employeetarget` ADD CONSTRAINT `EmployeeTarget_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_payroll` ADD CONSTRAINT `Payroll_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_payroll` ADD CONSTRAINT `hr_Payroll_salaryId_fkey` FOREIGN KEY (`salaryId`) REFERENCES `hr_employeesalary`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_payrolladjustment` ADD CONSTRAINT `PayrollAdjustment_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_salaryadvance` ADD CONSTRAINT `SalaryAdvance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_team` ADD CONSTRAINT `hr_Team_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `hr_employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_warning` ADD CONSTRAINT `Warning_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `access_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_warningrecipient` ADD CONSTRAINT `WarningRecipient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hr_warningrecipient` ADD CONSTRAINT `WarningRecipient_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `hr_warning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorydepartmentorder` ADD CONSTRAINT `inventory_InventoryDepartmentOrder_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorydepartmentordercomment` ADD CONSTRAINT `inventory_InventoryDepartmentOrderComment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `inventory_inventorydepartmentorder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorymovement` ADD CONSTRAINT `InventoryMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorymovement` ADD CONSTRAINT `InventoryMovement_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventoryproduct` ADD CONSTRAINT `InventoryProduct_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `inventory_productbrand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventoryproduct` ADD CONSTRAINT `InventoryProduct_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `inventory_productcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventoryproductimage` ADD CONSTRAINT `products_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorypurchasepayment` ADD CONSTRAINT `inventory_InventoryPurchasePayment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `inventory_inventorypurchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorystock` ADD CONSTRAINT `InventoryStock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_inventorystock` ADD CONSTRAINT `InventoryStock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventoryicucase` ADD CONSTRAINT `InventoryIcuCase_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_orderitems` ADD CONSTRAINT `laboratory_OrderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `laboratory_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_orderitems` ADD CONSTRAINT `laboratory_OrderItems_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `laboratory_tests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_orders` ADD CONSTRAINT `laboratory_Orders_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `crm_appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_orders` ADD CONSTRAINT `laboratory_Orders_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_billinginvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_orders` ADD CONSTRAINT `laboratory_Orders_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_orders` ADD CONSTRAINT `laboratory_Orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_paymentreceipts` ADD CONSTRAINT `laboratory_PaymentReceipts_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `laboratory_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_paymentreceipts` ADD CONSTRAINT `laboratory_PaymentReceipts_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `billing_billingpayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings_meeting` ADD CONSTRAINT `Meeting_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings_meeting` ADD CONSTRAINT `Meeting_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings_meetingparticipant` ADD CONSTRAINT `MeetingParticipant_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings_meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings_meetingparticipant` ADD CONSTRAINT `MeetingParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_possale` ADD CONSTRAINT `PosSale_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_possaleitem` ADD CONSTRAINT `PosSaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_possaleitem` ADD CONSTRAINT `PosSaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `pos_possale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_notification` ADD CONSTRAINT `Notification_crmLeadId_fkey` FOREIGN KEY (`crmLeadId`) REFERENCES `crm_crmlead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_notification` ADD CONSTRAINT `Notification_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings_meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_notification` ADD CONSTRAINT `Notification_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_notification` ADD CONSTRAINT `Notification_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `hr_warning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_project` ADD CONSTRAINT `tasks_Project_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_project` ADD CONSTRAINT `tasks_Project_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_task` ADD CONSTRAINT `Task_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_task` ADD CONSTRAINT `Task_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `access_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_task` ADD CONSTRAINT `tasks_Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `tasks_project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_taskassignee` ADD CONSTRAINT `TaskAssignee_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_taskassignee` ADD CONSTRAINT `TaskAssignee_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_taskattachment` ADD CONSTRAINT `TaskAttachment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_taskcomment` ADD CONSTRAINT `TaskComment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `access_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_taskcomment` ADD CONSTRAINT `TaskComment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_tasktimeentry` ADD CONSTRAINT `TaskTimeEntry_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_tasktimeentry` ADD CONSTRAINT `TaskTimeEntry_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `access_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_tasktimeentry` ADD CONSTRAINT `TaskTimeEntry_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
