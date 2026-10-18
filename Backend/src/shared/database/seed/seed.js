import { syncPermissionCatalog } from "../../security/sync-permissions.js";
import "dotenv/config";
import { prisma } from "../../../shared/database/client.js";
import { hashSecret } from "../../../core/security/BcryptPasswordHasher.js";
import { createPinLookup } from "../../../core/security/JwtTokenService.js";
import { seedBusinessModules } from "./seed-modules.js";

const seedRecordCount = Number.parseInt(
  process.env.SEED_RECORD_COUNT ?? "10",
  10,
);

if (!Number.isInteger(seedRecordCount) || seedRecordCount < 1) {
  throw new Error("SEED_RECORD_COUNT must be a positive integer");
}

const catalog = [
  ["users.view", "View users", "Users"],
  ["users.create", "Create users", "Users"],
  ["users.update", "Update users", "Users"],
  ["users.delete", "Delete users", "Users"],
  ["roles.view", "View roles", "Access Control"],
  ["roles.create", "Create roles", "Access Control"],
  ["roles.update", "Update roles", "Access Control"],
  ["roles.delete", "Delete roles", "Access Control"],
  ["roles.assign_permissions", "Assign permissions", "Access Control"],
  ["permissions.view", "View permissions", "Access Control"],
  ["system.logs.view", "View system logs", "System"],
  ["dashboard.view", "View dashboard", "Dashboard"],
  ["employees.view", "View employees", "Human Resources"],
  ["employees.manage", "Manage employees", "Human Resources"],
  ["payroll.process", "Process payroll", "Human Resources"],
  ["inventory.view", "View inventory", "Inventory"],
  ["inventory.manage", "Manage inventory", "Inventory"],
  ["inventory.adjust", "Adjust stock", "Inventory"],
  ["pos.use", "Use point of sale", "Point of Sale"],
  ["meetings.create", "Create department meetings", "Meetings"],
  ["finance.view", "View finances", "Accounting"],
  ["journal.create", "Create journals", "Accounting"],
  ["reports.generate", "Generate reports", "Reports"],
  ["accounting.accounts.view", "View accounts", "Accounting / Accounts"],
  ["accounting.accounts.create", "Create accounts", "Accounting / Accounts"],
  ["accounting.accounts.update", "Update accounts", "Accounting / Accounts"],
  ["accounting.accounts.delete", "Delete accounts", "Accounting / Accounts"],
  ["accounting.journals.view", "View journals", "Accounting / Journals"],
  ["accounting.journals.create", "Create journals", "Accounting / Journals"],
  ["accounting.journals.post", "Post journals", "Accounting / Journals"],
  ["accounting.journals.delete", "Delete journals", "Accounting / Journals"],
  ["accounting.customers.view", "View customers", "Accounting / Customers"],
  ["accounting.customers.create", "Create customers", "Accounting / Customers"],
  ["accounting.customers.update", "Update customers", "Accounting / Customers"],
  ["accounting.customers.delete", "Delete customers", "Accounting / Customers"],
  ["accounting.invoices.view", "View invoices", "Accounting / Invoices"],
  ["accounting.invoices.create", "Create invoices", "Accounting / Invoices"],
  ["accounting.invoices.update", "Update invoices", "Accounting / Invoices"],
  ["accounting.invoices.delete", "Delete invoices", "Accounting / Invoices"],
  ["accounting.payments.view", "View payments", "Accounting / Payments"],
  ["accounting.payments.create", "Create payments", "Accounting / Payments"],
  [
    "accounting.service_advances.view",
    "View service advances",
    "Accounting / Service Advances",
  ],
  [
    "accounting.service_advances.create",
    "Create service advances",
    "Accounting / Service Advances",
  ],
  [
    "accounting.service_advances.update",
    "Update service advances",
    "Accounting / Service Advances",
  ],
  [
    "accounting.service_advances.delete",
    "Delete service advances",
    "Accounting / Service Advances",
  ],
  [
    "accounting.reports.view",
    "View accounting reports",
    "Accounting / Reports",
  ],
];

async function seed() {
  for (const [key, name, module] of catalog)
    await prisma.permission.upsert({
      where: { key },
      update: { name, module },
      create: { key, name, module },
    });
  await syncPermissionCatalog();
  const permissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.upsert({
    where: { name: "Super Administrator" },
    update: {
      description:
        "Unrestricted access to every current and future system capability",
    },
    create: {
      name: "Super Administrator",
      description:
        "Unrestricted access to every current and future system capability",
    },
  });
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    })),
  });
  const accountantRole = await prisma.role.upsert({
    where: { name: "Accountant" },
    update: {
      description: "Manages accounts, journal entries and financial reports",
    },
    create: {
      name: "Accountant",
      description: "Manages accounts, journal entries and financial reports",
    },
  });
  const accountantPermissions = permissions.filter((permission) =>
    ["finance.view", "journal.create", "reports.generate"].includes(
      permission.key,
    ),
  );
  await prisma.rolePermission.deleteMany({
    where: { roleId: accountantRole.id },
  });
  await prisma.rolePermission.createMany({
    data: accountantPermissions.map((permission) => ({
      roleId: accountantRole.id,
      permissionId: permission.id,
    })),
  });
  const cashierRole = await prisma.role.upsert({
    where: { name: "Cashier" },
    update: { description: "Point-of-sale and own-profile access only" },
    create: {
      name: "Cashier",
      description: "Point-of-sale and own-profile access only",
    },
  });
  const posPermission = permissions.find(({ key }) => key === "pos.use");
  await prisma.rolePermission.deleteMany({ where: { roleId: cashierRole.id } });
  if (posPermission)
    await prisma.rolePermission.create({
      data: { roleId: cashierRole.id, permissionId: posPermission.id },
    });
  const passwordHash = await hashSecret("nho1234");
  const pinHash = await hashSecret("123456");
  const admin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {
      passwordHash,
      pinHash,
      pinLookup: createPinLookup("123456"),
      status: "active",
      name: "Super Administrator",
      department: "Administration",
    },
    create: {
      username: "superadmin",
      email: "superadmin@admin.local",
      name: "Super Administrator",
      department: "Administration",
      passwordHash,
      pinHash,
      pinLookup: createPinLookup("123456"),
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "Employee" },
    update: { description: "Standard employee self-service access" },
    create: {
      name: "Employee",
      description: "Standard employee self-service access",
    },
  });
  const doctorPosition = await prisma.position.upsert({
    where: { name: "Specialist Doctor" },
    update: { status: "active" },
    create: {
      name: "Specialist Doctor",
      description: "Clinical specialist",
      status: "active",
    },
  });
  const accountantPosition = await prisma.position.upsert({
    where: { name: "Accountant" },
    update: { status: "active" },
    create: {
      name: "Accountant",
      description: "Finance and accounting",
      status: "active",
    },
  });
  const cardiology = await prisma.department.upsert({
    where: { code: "CARD" },
    update: { status: "active" },
    create: {
      code: "CARD",
      name: "Cardiology",
      description: "Cardiology and cardiovascular services",
      status: "active",
    },
  });
  const finance = await prisma.department.upsert({
    where: { code: "FIN" },
    update: { status: "active" },
    create: {
      code: "FIN",
      name: "Finance",
      description: "Finance and accounting department",
      status: "active",
    },
  });
  const doctorUser = await prisma.user.upsert({
    where: { username: "doctor.demo" },
    update: {
      name: "Dr. Sara Ahmed",
      department: "Cardiology",
      status: "active",
    },
    create: {
      username: "doctor.demo",
      email: "doctor.demo@nho.local",
      name: "Dr. Sara Ahmed",
      department: "Cardiology",
      passwordHash,
      status: "active",
    },
  });
  const accountantUser = await prisma.user.upsert({
    where: { username: "accountant.demo" },
    update: { name: "Omar Hassan", department: "Finance", status: "active" },
    create: {
      username: "accountant.demo",
      email: "accountant.demo@nho.local",
      name: "Omar Hassan",
      department: "Finance",
      passwordHash,
      status: "active",
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: doctorUser.id, roleId: employeeRole.id },
    },
    update: {},
    create: { userId: doctorUser.id, roleId: employeeRole.id },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: accountantUser.id, roleId: accountantRole.id },
    },
    update: {},
    create: { userId: accountantUser.id, roleId: accountantRole.id },
  });
  const doctorEmployee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-1001" },
    update: {
      userId: doctorUser.id,
      departmentId: cardiology.id,
      positionId: doctorPosition.id,
      status: "active",
    },
    create: {
      employeeCode: "EMP-1001",
      userId: doctorUser.id,
      firstName: "Sara",
      lastName: "Ahmed",
      departmentId: cardiology.id,
      positionId: doctorPosition.id,
      hireDate: new Date("2023-01-15"),
      status: "active",
    },
  });
  const accountantEmployee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-1002" },
    update: {
      userId: accountantUser.id,
      departmentId: finance.id,
      positionId: accountantPosition.id,
      status: "active",
    },
    create: {
      employeeCode: "EMP-1002",
      userId: accountantUser.id,
      firstName: "Omar",
      lastName: "Hassan",
      departmentId: finance.id,
      positionId: accountantPosition.id,
      hireDate: new Date("2024-02-01"),
      status: "active",
    },
  });
  await prisma.department.update({
    where: { id: cardiology.id },
    data: { managerId: doctorEmployee.id },
  });
  await prisma.department.update({
    where: { id: finance.id },
    data: { managerId: accountantEmployee.id },
  });

  await prisma.task.deleteMany({
    where: { description: { startsWith: "SEED:" } },
  });
  await prisma.task.create({
    data: {
      title: "Prepare monthly finance report",
      description:
        "SEED: Review the monthly accounts, reconcile balances, and prepare the management finance report.",
      team: "other",
      priority: "high",
      status: "in_progress",
      startDate: new Date("2026-08-20T08:00:00Z"),
      dueDate: new Date("2026-08-28T16:00:00Z"),
      estimatedMinutes: 480,
      createdById: admin.id,
      assignees: { create: [{ employeeId: accountantEmployee.id }] },
      comments: {
        create: [
          {
            authorId: admin.id,
            body: "Please include the budget variance summary.",
          },
        ],
      },
      timeEntries: {
        create: [
          {
            employeeId: accountantEmployee.id,
            recordedById: admin.id,
            workDate: new Date("2026-08-24T09:00:00Z"),
            minutes: 180,
            note: "Account reconciliation and variance review",
          },
        ],
      },
    },
  });
  await prisma.task.create({
    data: {
      title: "Update cardiology patient workflow",
      description:
        "SEED: Review the cardiology patient journey and document improvements for appointments and follow-up care.",
      team: "content",
      priority: "medium",
      status: "review",
      startDate: new Date("2026-08-18T08:00:00Z"),
      dueDate: new Date("2026-08-27T16:00:00Z"),
      estimatedMinutes: 360,
      createdById: admin.id,
      assignees: { create: [{ employeeId: doctorEmployee.id }] },
      comments: {
        create: [
          {
            authorId: doctorUser.id,
            body: "The first workflow draft is ready for review.",
          },
        ],
      },
      timeEntries: {
        create: [
          {
            employeeId: doctorEmployee.id,
            recordedById: doctorUser.id,
            workDate: new Date("2026-08-23T10:00:00Z"),
            minutes: 240,
            note: "Reviewed clinical steps and documented follow-up flow",
          },
        ],
      },
    },
  });
  await prisma.task.create({
    data: {
      title: "Hospital operations coordination meeting",
      description:
        "SEED: Coordinate clinical and finance representatives and publish the agreed operational actions.",
      team: "other",
      priority: "urgent",
      status: "todo",
      startDate: new Date("2026-08-26T08:00:00Z"),
      dueDate: new Date("2026-08-30T16:00:00Z"),
      estimatedMinutes: 180,
      createdById: admin.id,
      assignees: {
        create: [
          { employeeId: doctorEmployee.id },
          { employeeId: accountantEmployee.id },
        ],
      },
    },
  });
  const doctorSalary =
    (await prisma.employeeSalary.findFirst({
      where: { employeeId: doctorEmployee.id, effectiveTo: null },
    })) ??
    (await prisma.employeeSalary.create({
      data: {
        employeeId: doctorEmployee.id,
        baseSalary: 2500000,
        currencyId: "USD",
        payType: "monthly",
        effectiveFrom: new Date("2026-01-01"),
      },
    }));
  const accountantSalary =
    (await prisma.employeeSalary.findFirst({
      where: { employeeId: accountantEmployee.id, effectiveTo: null },
    })) ??
    (await prisma.employeeSalary.create({
      data: {
        employeeId: accountantEmployee.id,
        baseSalary: 1500000,
        currencyId: "USD",
        payType: "monthly",
        effectiveFrom: new Date("2026-01-01"),
      },
    }));
  await prisma.payroll.upsert({
    where: {
      employeeId_year_month: {
        employeeId: accountantEmployee.id,
        year: 2026,
        month: 8,
      },
    },
    update: {},
    create: {
      employeeId: accountantEmployee.id,
      salaryId: accountantSalary.id,
      year: 2026,
      month: 8,
      baseSalary: 1500000,
      overtimeAmount: 100000,
      bonusAmount: 50000,
      allowanceAmount: 75000,
      grossSalary: 1725000,
      totalDeduction: 25000,
      lateDeduction: 25000,
      netSalary: 1700000,
      status: "approved",
    },
  });
  await prisma.doctorSpecialization.upsert({
    where: { name: "Cardiology" },
    update: {},
    create: { name: "Cardiology" },
  });
  await prisma.healthStaff.upsert({
    where: { employeeId: doctorEmployee.id },
    update: {
      departmentId: cardiology.id,
      status: "active",
      publicBookingEnabled: true,
    },
    create: {
      employeeId: doctorEmployee.id,
      departmentId: cardiology.id,
      staffType: "doctor",
      specialization: "Cardiology",
      licenseNumber: "MED-1001",
      biography: "Cardiology specialist",
      publicBookingEnabled: true,
      status: "active",
    },
  });
  const healthDoctor = await prisma.healthStaff.findUniqueOrThrow({
    where: { employeeId: doctorEmployee.id },
  });
  if (
    !(await prisma.appointment.findFirst({
      where: {
        patientPhone: "07500000001",
        scheduledAt: new Date("2026-08-25T09:00:00Z"),
      },
    }))
  )
    await prisma.appointment.create({
      data: {
        patientName: "Ali Karim",
        patientPhone: "07500000001",
        patientEmail: "ali@example.com",
        doctorId: healthDoctor.id,
        departmentId: cardiology.id,
        scheduledAt: new Date("2026-08-25T09:00:00Z"),
        durationMinutes: 30,
        reason: "Cardiology consultation",
        status: "confirmed",
        source: "website",
      },
    });

  const accounts = [
    ["1000", "Cash", "asset"],
    ["1100", "Accounts receivable", "asset"],
    ["1200", "Salary advances", "asset"],
    ["2100", "Patient service advances", "liability"],
    ["3000", "Owner equity", "equity"],
    ["4000", "Medical service revenue", "revenue"],
    ["5000", "Salary expense", "expense"],
  ];
  const seededAccounts = {};
  for (const [code, name, type] of accounts)
    seededAccounts[code] = await prisma.accountingAccount.upsert({
      where: { code },
      update: { name, type, status: "active" },
      create: { code, name, type, currency: "USD", status: "active" },
    });
  await prisma.journalEntry.upsert({
    where: { entryNumber: "JE-SEED-0001" },
    update: {},
    create: {
      entryNumber: "JE-SEED-0001",
      entryDate: new Date("2026-08-01"),
      description: "Opening capital",
      status: "posted",
      lines: {
        create: [
          { accountId: seededAccounts["1000"].id, debit: 10000000, credit: 0 },
          { accountId: seededAccounts["3000"].id, debit: 0, credit: 10000000 },
        ],
      },
    },
  });
  const customer = await prisma.billingCustomer.upsert({
    where: { code: "CUST-1001" },
    update: { status: "active" },
    create: {
      code: "CUST-1001",
      name: "Ali Karim",
      phone: "07500000001",
      email: "ali@example.com",
      address: "Erbil",
      status: "active",
    },
  });
  const invoice = await prisma.billingInvoice.upsert({
    where: { invoiceNumber: "INV-SEED-0001" },
    update: {},
    create: {
      invoiceNumber: "INV-SEED-0001",
      customerId: customer.id,
      issueDate: new Date("2026-08-20"),
      dueDate: new Date("2026-08-27"),
      currency: "USD",
      subtotal: 100000,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 100000,
      paidAmount: 50000,
      balanceAmount: 50000,
      status: "partial",
      notes: "Integrated seed invoice",
      items: {
        create: [
          {
            description: "Cardiology consultation",
            quantity: 1,
            unitPrice: 100000,
            discount: 0,
            taxRate: 0,
            lineTotal: 100000,
          },
        ],
      },
    },
  });
  if (
    !(await prisma.billingPayment.findFirst({
      where: { invoiceId: invoice.id, reference: "PAY-SEED-0001" },
    }))
  )
    await prisma.billingPayment.create({
      data: {
        invoiceId: invoice.id,
        amount: 50000,
        method: "cash",
        reference: "PAY-SEED-0001",
        paidAt: new Date("2026-08-20"),
      },
    });
  if (
    !(await prisma.salaryAdvance.findFirst({
      where: {
        employeeId: accountantEmployee.id,
        notes: "Integrated seed advance",
      },
    }))
  )
    await prisma.salaryAdvance.create({
      data: {
        employeeId: accountantEmployee.id,
        amount: 300000,
        currency: "USD",
        requestedAt: new Date("2026-08-10"),
        approvedAt: new Date("2026-08-11"),
        deductionStartDate: new Date("2026-09-01"),
        installments: 3,
        deductedAmount: 0,
        remainingAmount: 300000,
        status: "approved",
        notes: "Integrated seed advance",
      },
    });
  await prisma.serviceAdvance.upsert({
    where: { receiptNumber: "ADV-SEED-0001" },
    update: {},
    create: {
      receiptNumber: "ADV-SEED-0001",
      patientName: "Ali Karim",
      patientPhone: "07500000001",
      departmentId: cardiology.id,
      amount: 150000,
      appliedAmount: 50000,
      balanceAmount: 100000,
      currency: "USD",
      method: "cash",
      reference: "SERVICE-SEED",
      receivedAt: new Date("2026-08-20"),
      status: "partially_applied",
      notes: "Integrated hospital service advance",
    },
  });

  const financeCategories = [
    "Clinical services",
    "Payroll",
    "Medical supplies",
    "Equipment",
    "Operations",
  ];
  await prisma.financeCashFlow.deleteMany({
    where: { description: { startsWith: "SEED:" } },
  });
  await prisma.financeCashFlow.createMany({
    data: Array.from({ length: seedRecordCount }, (_, index) => ({
      flowDate: new Date(Date.UTC(2026, index % 12, 1 + (index % 27))),
      flowType: index % 3 === 0 ? "outflow" : "inflow",
      category: financeCategories[index % financeCategories.length],
      amount: 250000 + index * 85000,
      currency: "USD",
      description: `SEED: ${index % 3 === 0 ? "Planned operating payment" : "Expected service receipt"} ${index + 1}`,
      status: ["planned", "confirmed", "confirmed"][index % 3],
    })),
  });
  await seedBusinessModules(seedRecordCount);
  console.log(
    `Integrated seed complete with ${seedRecordCount} demo records per module. Users: superadmin, doctor.demo, accountant.demo | Password: nho1234 | Admin PIN: 123456`,
  );
}
seed().finally(() => prisma.$disconnect());
