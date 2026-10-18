import { prisma } from "../client.js";
import { hashSecret } from "../../../core/security/BcryptPasswordHasher.js";

const pad = (value) => String(value).padStart(2, "0");

const people = [
  ["Ari", "Hassan"],
  ["Shilan", "Karim"],
  ["Rebin", "Ahmed"],
  ["Darya", "Mahmoud"],
  ["Soran", "Abdullah"],
  ["Lana", "Omar"],
  ["Kawa", "Rashid"],
  ["Narin", "Salih"],
  ["Haval", "Mustafa"],
  ["Rojin", "Ali"],
];
const patientNames = [
  "Baran Mohammed",
  "Avin Jalal",
  "Dilshad Rahman",
  "Zana Farhad",
  "Hana Ibrahim",
  "Karwan Ismail",
  "Nawroz Kamal",
  "Zhino Adnan",
  "Sirwan Latif",
  "Tara Yousif",
];
const departmentNames = [
  "Emergency Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Radiology",
  "General Surgery",
  "Dermatology",
  "Ophthalmology",
  "Orthopedics",
  "Neurology",
  "Clinical Laboratory",
];
const positionNames = [
  "Emergency Physician",
  "Registered Nurse",
  "Pediatric Specialist",
  "Radiology Technician",
  "General Surgeon",
  "Clinical Pharmacist",
  "Laboratory Technician",
  "Patient Coordinator",
  "Medical Receptionist",
  "Healthcare Administrator",
];
const specialties = [
  "Emergency care",
  "Adult medicine",
  "Child health",
  "Diagnostic imaging",
  "General surgery",
  "Clinical pharmacy",
  "Laboratory diagnostics",
  "Patient services",
  "Medical administration",
  "Healthcare operations",
];

export async function seedBusinessModules(count = 10) {
  const passwordHash = await hashSecret("nho1234");
  const employeeRole = await prisma.role.findUniqueOrThrow({
    where: { name: "Employee" },
  });
  const departments = [];
  const positions = [];
  const employees = [];
  const salaries = [];

  for (let index = 1; index <= count; index += 1) {
    const suffix = pad(index);
    const [firstName, lastName] = people[(index - 1) % people.length];
    const departmentName =
      departmentNames[(index - 1) % departmentNames.length];
    const positionName = positionNames[(index - 1) % positionNames.length];
    const role = await prisma.role.upsert({
      where: { name: `Seed Role ${suffix}` },
      update: { description: `SEED: Access role ${suffix}` },
      create: {
        name: `Seed Role ${suffix}`,
        description: `SEED: Access role ${suffix}`,
      },
    });
    const position = await prisma.position.upsert({
      where: { name: positionName },
      update: {
        description: `SEED: ${positionName}`,
        status: "active",
      },
      create: {
        name: positionName,
        description: `SEED: ${positionName}`,
        status: "active",
      },
    });
    positions.push(position);
    const department = await prisma.department.upsert({
      where: { code: `SD${suffix}` },
      update: {
        name: departmentName,
        description: `SEED: ${departmentName} department`,
        status: "active",
      },
      create: {
        code: `SD${suffix}`,
        name: departmentName,
        description: `SEED: ${departmentName} department`,
        status: "active",
      },
    });
    departments.push(department);
    const user = await prisma.user.upsert({
      where: { username: `seed.user${suffix}` },
      update: {
        name: `${firstName} ${lastName}`,
        department: department.name,
        passwordHash,
        status: "active",
      },
      create: {
        username: `seed.user${suffix}`,
        email: `seed.user${suffix}@nho.local`,
        name: `${firstName} ${lastName}`,
        department: department.name,
        passwordHash,
        status: "active",
      },
    });
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: index % 2 ? employeeRole.id : role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: index % 2 ? employeeRole.id : role.id,
      },
    });
    const employee = await prisma.employee.upsert({
      where: { employeeCode: `SEED-EMP-${String(index).padStart(3, "0")}` },
      update: {
        userId: user.id,
        firstName,
        lastName,
        departmentId: department.id,
        positionId: position.id,
        status: "active",
      },
      create: {
        employeeCode: `SEED-EMP-${String(index).padStart(3, "0")}`,
        userId: user.id,
        firstName,
        lastName,
        departmentId: department.id,
        positionId: position.id,
        hireDate: new Date(
          Date.UTC(2022 + (index % 4), index % 12, 1 + (index % 20)),
        ),
        status: "active",
      },
    });
    employees.push(employee);
    await prisma.department.update({
      where: { id: department.id },
      data: { managerId: employee.id },
    });
    await prisma.payroll.deleteMany({ where: { employeeId: employee.id } });
    await prisma.employeeSalary.deleteMany({
      where: { employeeId: employee.id },
    });
    const salary = await prisma.employeeSalary.create({
      data: {
        employeeId: employee.id,
        baseSalary: 900000 + index * 35000,
        currencyId: "USD",
        payType: "monthly",
        effectiveFrom: new Date("2026-01-01"),
      },
    });
    salaries.push(salary);
    await prisma.healthStaff.upsert({
      where: { employeeId: employee.id },
      update: {
        departmentId: department.id,
        staffType:
          index % 4 === 0
            ? "doctor"
            : index % 4 === 1
              ? "nurse"
              : index % 4 === 2
                ? "technician"
                : "pharmacist",
        specialization: specialties[(index - 1) % specialties.length],
        publicBookingEnabled: index % 4 === 0,
        status: "active",
      },
      create: {
        employeeId: employee.id,
        departmentId: department.id,
        staffType:
          index % 4 === 0
            ? "doctor"
            : index % 4 === 1
              ? "nurse"
              : index % 4 === 2
                ? "technician"
                : "pharmacist",
        specialization: specialties[(index - 1) % specialties.length],
        licenseNumber: `SEED-LIC-${suffix}`,
        biography: `SEED: Health professional ${suffix}`,
        publicBookingEnabled: index % 4 === 0,
        status: "active",
      },
    });
  }

  const employeeIds = employees.map(({ id }) => id);
  await prisma.employeeAttendance.deleteMany({
    where: { employeeId: { in: employeeIds } },
  });
  await prisma.payroll.deleteMany({
    where: { employeeId: { in: employeeIds } },
  });
  await prisma.salaryAdvance.deleteMany({
    where: { employeeId: { in: employeeIds } },
  });
  await prisma.employeeAttendance.createMany({
    data: employees.map((employee, index) => ({
      employeeId: employee.id,
      attendanceDate: new Date(Date.UTC(2026, 7, 1 + (index % 21))),
      checkIn: new Date(Date.UTC(2026, 7, 1 + (index % 21), 6)),
      checkOut: new Date(Date.UTC(2026, 7, 1 + (index % 21), 14)),
      workedMinutes: 480,
      lateMinutes: index % 5 === 0 ? 15 : 0,
      overtimeMinutes: index % 7 === 0 ? 30 : 0,
      status: "present",
    })),
  });
  await prisma.payroll.createMany({
    data: employees.map((employee, index) => {
      const baseSalary = 900000 + (index + 1) * 35000;
      const bonus = index % 5 === 0 ? 100000 : 0;
      return {
        employeeId: employee.id,
        salaryId: salaries[index].id,
        year: 2026,
        month: 8,
        baseSalary,
        bonusAmount: bonus,
        grossSalary: baseSalary + bonus,
        totalDeduction: 25000,
        lateDeduction: 25000,
        netSalary: baseSalary + bonus - 25000,
        status: index % 3 === 0 ? "paid" : "approved",
        paidAt: index % 3 === 0 ? new Date("2026-08-28") : null,
      };
    }),
  });
  await prisma.salaryAdvance.createMany({
    data: employees.map((employee, index) => ({
      employeeId: employee.id,
      amount: 100000 + index * 10000,
      currency: "USD",
      requestedAt: new Date(Date.UTC(2026, 6, 1 + (index % 25))),
      approvedAt: new Date(Date.UTC(2026, 6, 2 + (index % 25))),
      deductionStartDate: new Date("2026-09-01"),
      installments: 2 + (index % 4),
      deductedAmount: 0,
      remainingAmount: 100000 + index * 10000,
      status: "approved",
      notes: `SEED: Salary advance ${index + 1}`,
    })),
  });

  const staff = await prisma.healthStaff.findMany({
    where: { employeeId: { in: employeeIds } },
  });
  await prisma.appointment.deleteMany({
    where: { patientEmail: { startsWith: "seed.patient" } },
  });
  await prisma.appointment.createMany({
    data: Array.from({ length: count }, (_, index) => ({
      patientName: patientNames[index % patientNames.length],
      patientPhone: `0751000${String(index + 1).padStart(4, "0")}`,
      patientEmail: `seed.patient${pad(index + 1)}@example.com`,
      doctorId: staff[index % staff.length].id,
      departmentId: departments[index % departments.length].id,
      scheduledAt: new Date(
        Date.UTC(2026, 8, 1 + (index % 25), 7 + (index % 8)),
      ),
      durationMinutes: 30,
      reason: `SEED: Consultation ${index + 1}`,
      status: ["pending", "confirmed", "completed"][index % 3],
      source: index % 2 ? "admin" : "website",
    })),
  });

  // Healthcare CRM: realistic leads, patients, surgeries, appointments, and payments.
  for (let index = 0; index < count; index += 1) {
    const data = {
      code: `LEAD-${pad(index + 1)}`,
      name: patientNames[index % patientNames.length],
      phone: `075040${String(index + 1).padStart(5, "0")}`,
      email: `crm.patient${pad(index + 1)}@example.com`,
      source: ["website", "phone", "referral", "social_media"][index % 4],
      age: 20 + (index % 50),
      gender: index % 2 ? "female" : "male",
      address: ["Erbil", "Sulaymaniyah", "Duhok", "Kirkuk"][index % 4],
      interest: [
        "General consultation",
        "Dental treatment",
        "Eye examination",
        "Surgery consultation",
      ][index % 4],
      notes: `SEED: CRM lead ${index + 1}`,
      status: ["new", "contacted", "qualified", "qualified", "lost"][index % 5],
    };
    await prisma.crmLead.upsert({
      where: { id: `seed-crm-lead-${String(index + 1).padStart(3, "0")}` },
      update: data,
      create: {
        id: `seed-crm-lead-${String(index + 1).padStart(3, "0")}`,
        ...data,
      },
    });
  }

  const crmPatients = [];
  for (let index = 0; index < count; index += 1) {
    const [firstName, lastName] =
      patientNames[index % patientNames.length].split(" ");
    crmPatients.push(
      await prisma.patient.upsert({
        where: { patientCode: `PAT-${index + 1}` },
        update: {
          firstName,
          lastName,
          phone: `075050${String(index + 1).padStart(5, "0")}`,
          status: "active",
        },
        create: {
          patientCode: `PAT-${index + 1}`,
          firstName,
          lastName,
          phone: `075050${String(index + 1).padStart(5, "0")}`,
          email: `patient${pad(index + 1)}@example.com`,
          dateOfBirth: new Date(
            Date.UTC(1980 + index * 3, index % 12, 5 + index),
          ),
          gender: index % 2 ? "female" : "male",
          address: ["Erbil", "Sulaymaniyah", "Duhok", "Kirkuk"][index % 4],
          bloodType: ["A+", "O+", "B+", "AB+", "A-"][index % 5],
          allergies: index % 3 === 0 ? "Penicillin" : null,
          medicalNotes: `SEED: Patient medical profile ${index + 1}`,
          status: "active",
        },
      }),
    );
  }

  for (let index = 0; index < crmPatients.length; index += 1) {
    const data = {
      patientId: crmPatients[index].id,
      referrerName: [
        "Ahmed Hassan",
        "Dr. Shirin Karim",
        "NHO Outreach Team",
        "Sara Mahmood",
        "Kurdistan Health Center",
      ][index % 5],
      referrerPhone: `075060${String(index + 1).padStart(5, "0")}`,
      referralType: ["patient", "doctor", "employee", "organization", "other"][
        index % 5
      ],
      referredAt: new Date(Date.UTC(2026, 7 + (index % 2), 10 + index)),
      notes: `SEED: Patient referral ${index + 1}`,
      status: ["active", "completed", "active", "cancelled"][index % 4],
    };
    await prisma.patientReferral.upsert({
      where: { id: `seed-crm-referral-${String(index + 1).padStart(3, "0")}` },
      update: data,
      create: {
        id: `seed-crm-referral-${String(index + 1).padStart(3, "0")}`,
        ...data,
      },
    });
  }

  const surgeryNames = [
    "Appendectomy",
    "Cataract surgery",
    "Knee arthroscopy",
    "Hernia repair",
    "Tonsillectomy",
    "Gallbladder removal",
    "Cesarean section",
    "Coronary angioplasty",
    "Sinus surgery",
    "Carpal tunnel release",
  ];
  const crmSurgeries = [];
  for (let index = 0; index < count; index += 1)
    crmSurgeries.push(
      await prisma.surgery.upsert({
        where: { code: `SUR-${String(index + 1).padStart(3, "0")}` },
        update: {
          name: surgeryNames[index % surgeryNames.length],
          status: "active",
        },
        create: {
          code: `SUR-${String(index + 1).padStart(3, "0")}`,
          name: surgeryNames[index % surgeryNames.length],
          description: `SEED: ${surgeryNames[index % surgeryNames.length]} procedure`,
          durationMinutes: 45 + index * 15,
          basePrice: 500000 + index * 175000,
          status: "active",
        },
      }),
    );

  const doctors = staff.filter(({ staffType }) => staffType === "doctor");
  const surgeryAppointments = [];
  for (let index = 0; index < count; index += 1)
    surgeryAppointments.push(
      await prisma.surgeryAppointment.upsert({
        where: {
          id: `seed-crm-surgery-appointment-${String(index + 1).padStart(3, "0")}`,
        },
        update: {
          patientId: crmPatients[index].id,
          doctorId: (
            doctors[index % doctors.length] ?? staff[index % staff.length]
          ).id,
          surgeryId: crmSurgeries[index].id,
          scheduledAt: new Date(
            Date.UTC(2026, 8 + (index % 3), 3 + index, 7 + (index % 6)),
          ),
          operatingRoom: `OR-${1 + (index % 4)}`,
          status: ["scheduled", "confirmed", "in_progress", "completed"][
            index % 4
          ],
        },
        create: {
          id: `seed-crm-surgery-appointment-${String(index + 1).padStart(3, "0")}`,
          patientId: crmPatients[index].id,
          doctorId: (
            doctors[index % doctors.length] ?? staff[index % staff.length]
          ).id,
          surgeryId: crmSurgeries[index].id,
          scheduledAt: new Date(
            Date.UTC(2026, 8 + (index % 3), 3 + index, 7 + (index % 6)),
          ),
          operatingRoom: `OR-${1 + (index % 4)}`,
          status: ["scheduled", "confirmed", "in_progress", "completed"][
            index % 4
          ],
          preOpNotes: `SEED: Pre-operation assessment ${index + 1}`,
          postOpNotes:
            index % 4 === 3 ? "SEED: Procedure completed successfully" : null,
        },
      }),
    );
  for (let index = 0; index < surgeryAppointments.length; index += 1) {
    const data = {
      patientId: crmPatients[index].id,
      surgeryAppointmentId: surgeryAppointments[index].id,
      amount: 250000 + index * 125000,
      paymentMethod: ["cash", "card", "bank_transfer", "insurance"][index % 4],
      reference: `CRM-PAY-${String(index + 1).padStart(4, "0")}`,
      notes: `SEED: Surgery payment ${index + 1}`,
      paidAt: new Date(Date.UTC(2026, 7 + (index % 3), 2 + index, 9)),
      status: index % 4 === 0 ? "pending" : "paid",
    };
    await prisma.patientPayment.upsert({
      where: { id: `seed-crm-payment-${String(index + 1).padStart(3, "0")}` },
      update: data,
      create: {
        id: `seed-crm-payment-${String(index + 1).padStart(3, "0")}`,
        ...data,
      },
    });
  }

  const seedAccounts = [];
  for (let index = 1; index <= count; index += 1)
    seedAccounts.push(
      await prisma.accountingAccount.upsert({
        where: { code: `S${1000 + index}` },
        update: {
          name: `Seed Account ${pad(index)}`,
          type: ["asset", "liability", "equity", "revenue", "expense"][
            index % 5
          ],
          status: "active",
        },
        create: {
          code: `S${1000 + index}`,
          name: `Seed Account ${pad(index)}`,
          type: ["asset", "liability", "equity", "revenue", "expense"][
            index % 5
          ],
          currency: "USD",
          status: "active",
        },
      }),
    );
  await prisma.journalEntry.deleteMany({
    where: { entryNumber: { startsWith: "JE-SEED-BULK-" } },
  });
  const cash = await prisma.accountingAccount.findUniqueOrThrow({
    where: { code: "1000" },
  });
  const revenue = await prisma.accountingAccount.findUniqueOrThrow({
    where: { code: "4000" },
  });
  for (let index = 1; index <= count; index += 1) {
    const amount = 100000 + index * 25000;
    await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-SEED-BULK-${String(index).padStart(3, "0")}`,
        entryDate: new Date(Date.UTC(2026, index % 12, 1 + (index % 20))),
        description: `SEED: Medical revenue journal ${index}`,
        reference: `SEED-JR-${index}`,
        status: "posted",
        lines: {
          create: [
            { accountId: cash.id, debit: amount, credit: 0 },
            { accountId: revenue.id, debit: 0, credit: amount },
          ],
        },
      },
    });
  }

  await prisma.billingPayment.deleteMany({
    where: { reference: { startsWith: "SEED-PAY-" } },
  });
  await prisma.billingInvoice.deleteMany({
    where: { invoiceNumber: { startsWith: "INV-SEED-BULK-" } },
  });
  for (let index = 1; index <= count; index += 1) {
    const suffix = String(index).padStart(3, "0");
    const customer = await prisma.billingCustomer.upsert({
      where: { code: `SEED-CUST-${suffix}` },
      update: {
        name: patientNames[(index - 1) % patientNames.length],
        status: "active",
      },
      create: {
        code: `SEED-CUST-${suffix}`,
        name: patientNames[(index - 1) % patientNames.length],
        phone: `0752000${String(index).padStart(4, "0")}`,
        email: `seed.customer${suffix}@example.com`,
        address: "Erbil",
        status: "active",
      },
    });
    const total = 75000 + index * 5000;
    const paidAmount = index % 2 ? total : 1000;
    const invoice = await prisma.billingInvoice.create({
      data: {
        invoiceNumber: `INV-SEED-BULK-${suffix}`,
        customerId: customer.id,
        issueDate: new Date(Date.UTC(2026, index % 12, 1 + (index % 20))),
        dueDate: new Date(Date.UTC(2026, index % 12, 8 + (index % 20))),
        currency: "USD",
        subtotal: total,
        totalAmount: total,
        paidAmount,
        balanceAmount: total - paidAmount,
        status: index % 2 ? "paid" : "partial",
        notes: `SEED: Invoice ${suffix}`,
        items: {
          create: [
            {
              description: `SEED: Medical service ${suffix}`,
              quantity: 1,
              unitPrice: total,
              lineTotal: total,
            },
          ],
        },
      },
    });
    await prisma.billingPayment.create({
      data: {
        invoiceId: invoice.id,
        amount: paidAmount,
        method: ["cash", "card", "bank_transfer"][index % 3],
        reference: `SEED-PAY-${suffix}`,
        paidAt: new Date(Date.UTC(2026, index % 12, 2 + (index % 20))),
        notes: "SEED: Integrated payment",
      },
    });
  }
  await prisma.serviceAdvance.deleteMany({
    where: { receiptNumber: { startsWith: "SEED-SVC-" } },
  });
  await prisma.serviceAdvance.createMany({
    data: Array.from({ length: count }, (_, index) => ({
      receiptNumber: `SEED-SVC-${String(index + 1).padStart(3, "0")}`,
      patientName: patientNames[index % patientNames.length],
      patientPhone: `0753000${String(index + 1).padStart(4, "0")}`,
      departmentId: departments[index % departments.length].id,
      amount: 100000 + index * 5000,
      appliedAmount: index % 2 ? 50000 : 0,
      balanceAmount: 50000 + index * 5000,
      currency: "USD",
      method: ["cash", "card", "bank_transfer"][index % 3],
      reference: `SEED-SVC-REF-${index + 1}`,
      receivedAt: new Date(Date.UTC(2026, 7, 1 + (index % 25))),
      status: index % 2 ? "partially_applied" : "open",
      notes: "SEED: Hospital service advance",
    })),
  });

  await prisma.inventoryMovement.deleteMany({
    where: { reference: { startsWith: "SEED-" } },
  });
  await prisma.posSale.deleteMany({
    where: { saleNumber: { startsWith: "POS-SEED-" } },
  });
  const categories = [],
    brands = [],
    warehouses = [],
    products = [];
  for (let index = 1; index <= count; index += 1) {
    const suffix = String(index).padStart(3, "0");
    categories.push(
      await prisma.productCategory.upsert({
        where: { name: `Seed Category ${suffix}` },
        update: {
          description: `SEED: Product category ${suffix}`,
          status: "active",
        },
        create: {
          name: `Seed Category ${suffix}`,
          description: `SEED: Product category ${suffix}`,
          status: "active",
        },
      }),
    );
    brands.push(
      await prisma.productBrand.upsert({
        where: { name: `Seed Brand ${suffix}` },
        update: {
          description: `SEED: Product brand ${suffix}`,
          status: "active",
        },
        create: {
          name: `Seed Brand ${suffix}`,
          description: `SEED: Product brand ${suffix}`,
          status: "active",
        },
      }),
    );
    warehouses.push(
      await prisma.inventoryWarehouse.upsert({
        where: { code: `SEED-WH-${suffix}` },
        update: {
          name: `Seed Warehouse ${suffix}`,
          location: `Storage zone ${suffix}`,
          status: "active",
        },
        create: {
          code: `SEED-WH-${suffix}`,
          name: `Seed Warehouse ${suffix}`,
          location: `Storage zone ${suffix}`,
          status: "active",
        },
      }),
    );
  }
  for (let index = 1; index <= count; index += 1) {
    const suffix = String(index).padStart(3, "0"),
      quantity = 100;
    const product = await prisma.inventoryProduct.upsert({
      where: { sku: `SEED-SKU-${suffix}` },
      update: {
        name: `Seed Medical Product ${suffix}`,
        categoryId: categories[index - 1].id,
        brandId: brands[index - 1].id,
        costPrice: 2500 + index * 100,
        sellingPrice: 4000 + index * 150,
        taxRate: index % 3 === 0 ? 5 : 0,
        status: "active",
      },
      create: {
        sku: `SEED-SKU-${suffix}`,
        barcode: `990000${suffix}`,
        name: `Seed Medical Product ${suffix}`,
        categoryId: categories[index - 1].id,
        brandId: brands[index - 1].id,
        unit: "item",
        costPrice: 2500 + index * 100,
        sellingPrice: 4000 + index * 150,
        taxRate: index % 3 === 0 ? 5 : 0,
        status: "active",
      },
    });
    products.push(product);
    if (index % 5 === 0)
      await prisma.inventoryProduct.update({
        where: { id: product.id },
        data: {
          discountType: index % 10 === 0 ? "fixed" : "percentage",
          discountValue: index % 10 === 0 ? 500 : 10,
          discountStart: new Date("2026-08-01"),
          discountEnd: new Date("2026-09-30"),
        },
      });
    await prisma.inventoryStock.deleteMany({
      where: { productId: product.id, warehouseId: { not: warehouses[0].id } },
    });
    await prisma.inventoryStock.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouses[0].id,
        },
      },
      update: { quantity, reorderLevel: 20 },
      create: {
        productId: product.id,
        warehouseId: warehouses[0].id,
        quantity,
        reorderLevel: 20,
      },
    });
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        warehouseId: warehouses[0].id,
        movementType: "purchase",
        quantity,
        reference: `SEED-OPEN-${suffix}`,
        notes: "SEED: Opening stock",
      },
    });
    const price = product.sellingPrice,
      tax = (price * product.taxRate) / 100;
    await prisma.posSale.create({
      data: {
        saleNumber: `POS-SEED-${suffix}`,
        warehouseId: warehouses[0].id,
        customerName: patientNames[index % patientNames.length],
        paymentMethod: ["cash", "card", "bank_transfer"][index % 3],
        subtotal: price,
        taxAmount: tax,
        totalAmount: price + tax,
        paidAmount: price + tax,
        cashierName: "Seed Cashier",
        soldAt: new Date(Date.UTC(2026, 7, 1 + (index % 20), 8 + (index % 8))),
        items: {
          create: [
            {
              productId: product.id,
              quantity: 1,
              unitPrice: price,
              taxRate: product.taxRate,
              lineTotal: price + tax,
            },
          ],
        },
      },
    });
  }
}
