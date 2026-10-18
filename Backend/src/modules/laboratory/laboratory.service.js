import { randomUUID } from "node:crypto";
import { effectivePermissions } from "../../shared/security/access-policy.js";
import { z } from "zod";
import { prisma } from "../../shared/database/client.js";
import { paginate } from "../../shared/database/paginate.js";
import { createPatient } from "../crm/patient/patient-code.js";
import {
  createBillingInvoice,
  createBillingPayment,
} from "../accounting/billing/billing.model.js";
import { getSettings } from "../settings/settings.service.js";
import {
  testSchema,
  orderSchema,
  stageSchema,
  resultsSchema,
  paymentSchema,
} from "./laboratory.schema.js";

const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const include = {
  patient: {
    select: {
      id: true,
      patientCode: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
    },
  },
  lead: { select: { id: true, name: true, code: true } },
  appointment: { select: { id: true, scheduledAt: true, patientName: true } },
  invoice: { include: { payments: { orderBy: { paidAt: "desc" } } } },
  items: true,
};
export function queueDay(date, timezone) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (name) => parts.find((p) => p.type === name).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function createLaboratoryOrder(db, input, actor, policy) {
  return db.$transaction(async (tx) => {
    const previous = await tx.laboratoryOrder.findUnique({
      where: { requestId: input.requestId },
      include,
    });
    if (previous) return previous;
    const tests = await tx.laboratoryTest.findMany({
      where: { id: { in: input.testIds }, status: "active" },
    });
    if (tests.length !== input.testIds.length)
      fail("Select active laboratory tests.");
    let patient;
    if (input.patientId)
      patient = await tx.patient.findUniqueOrThrow({
        where: { id: input.patientId },
      });
    else if (input.leadId) {
      await tx.$queryRaw`SELECT id FROM crm_CrmLead WHERE id = ${input.leadId} FOR UPDATE`;
      const lead = await tx.crmLead.findUniqueOrThrow({
        where: { id: input.leadId },
      });
      if (lead.convertedPatientId)
        patient = await tx.patient.findUniqueOrThrow({
          where: { id: lead.convertedPatientId },
        });
      else {
        const [firstName, ...rest] = lead.name.trim().split(/\s+/);
        patient = await createPatient(tx, {
          firstName,
          lastName: rest.join(" ") || "Patient",
          phone: lead.phone,
          email: lead.email,
          gender: lead.gender,
          address: lead.address,
          status: "active",
        });
        await tx.crmLead.update({
          where: { id: lead.id },
          data: { convertedPatientId: patient.id, status: "converted" },
        });
        if (lead.status !== "converted")
          await tx.crmLeadStatusHistory.create({
            data: {
              leadId: lead.id,
              fromStatus: lead.status,
              toStatus: "converted",
            },
          });
      }
    } else
      patient = await createPatient(tx, { ...input.patient, status: "active" });
    if (input.appointmentId) {
      const appointment = await tx.appointment.findUniqueOrThrow({
        where: { id: input.appointmentId },
      });
      const normalize = (phone) => String(phone).replace(/\D/g, "");
      if (normalize(appointment.patientPhone) !== normalize(patient.phone))
        fail("The appointment must belong to the selected patient.");
    }
    const total =
      tests.reduce(
        (sum, test) => sum + Math.round(Number(test.price) * 100),
        0,
      ) / 100;
    const customer = await tx.billingCustomer.upsert({
      where: { code: `LAB-${patient.patientCode}` },
      create: {
        code: `LAB-${patient.patientCode}`,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        email: patient.email,
      },
      update: {
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        email: patient.email,
      },
    });
    const invoice = await createBillingInvoice(tx, {
      customerId: customer.id,
      issueDate: new Date(),
      currency: policy.currency,
      subtotal: total,
      totalAmount: total,
      balanceAmount: total,
      status: total === 0 ? "paid" : "sent",
      notes: input.notes,
      items: {
        create: tests.map((test) => ({
          description: test.name,
          quantity: 1,
          unitPrice: Number(test.price),
          lineTotal: Number(test.price),
        })),
      },
    });
    const day = queueDay(new Date(), policy.timezone);
    const counter = await tx.laboratoryDailyQueue.upsert({
      where: { day },
      create: { day, nextNumber: 1 },
      update: { nextNumber: { increment: 1 } },
    });
    return tx.laboratoryOrder.create({
      data: {
        requestId: input.requestId,
        patientId: patient.id,
        leadId: input.leadId,
        appointmentId: input.appointmentId,
        invoiceId: invoice.id,
        queueDay: day,
        queueNumber: counter.nextNumber,
        status: total === 0 ? "waiting" : "awaiting_payment",
        notes: input.notes,
        createdByName: actor,
        items: {
          create: tests.map((test) => ({
            testId: test.id,
            testName: test.name,
            specimen: test.specimen,
            price: test.price,
            unit: test.unit,
            referenceRange: test.referenceRange,
          })),
        },
      },
      include,
    });
  });
}

export async function advanceLaboratoryOrder(db, id, status, actor) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM laboratory_Orders WHERE id = ${id} FOR UPDATE`;
    const order = await tx.laboratoryOrder.findUniqueOrThrow({
      where: { id },
      include,
    });
    if (order.invoice.status !== "paid" || order.invoice.balanceAmount > 0.001)
      fail("Full invoice payment is required before laboratory work.", 409);
    const transitions = {
      waiting: "collecting",
      collecting: "processing",
      processing: "completed",
      completed: "received",
      received: "called",
      called: "delivered",
    };
    if (order.status === status) return order;
    if (
      transitions[order.status] !== status &&
      !(order.status === "waiting" && status === "processing")
    )
      fail(
        "Invalid laboratory stage. Refresh the queue and complete the current step first.",
        409,
      );
    if (
      status === "received" &&
      (!Array.isArray(order.attachments) ||
        !order.attachments.some(
          (file) =>
            file.mime === "application/pdf" || file.mime?.startsWith("image/"),
        ))
    )
      fail(
        "Attach the PDF or image result report before sending it to Received.",
        409,
      );
    if (
      status === "completed" &&
      order.items.some((item) => !item.result?.trim())
    )
      fail("Enter a result for every test before completing the request.", 409);
    return tx.laboratoryOrder.update({
      where: { id },
      data: {
        status,
        ...(status === "received" && { receivedAt: new Date() }),
        ...(status === "called" && {
          contactedAt: new Date(),
          contactedByName: actor,
        }),
        ...(status === "delivered" && {
          deliveredAt: new Date(),
          deliveredByName: actor,
        }),
        ...((status === "collecting" ||
          (order.status === "waiting" && status === "processing")) && {
          collectedAt: new Date(),
          collectedByName: actor,
        }),
        ...(status === "completed" && {
          completedAt: new Date(),
          completedByName: actor,
        }),
      },
      include,
    });
  });
}

export const laboratoryService = {
  requestPatient: (id, actor) =>
    prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM laboratory_Orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.laboratoryOrder.findUniqueOrThrow({
        where: { id },
        include,
      });
      if (
        !["waiting", "collecting"].includes(order.status) ||
        order.invoice.status !== "paid"
      )
        fail(
          "Only paid patients waiting for laboratory work can be requested.",
          409,
        );
      const users = await tx.user.findMany({
        where: { status: "active" },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: { include: { permission: true } } },
              },
            },
          },
        },
      });
      const recipients = users.filter(
        (user) =>
          user.roles.some(({ role }) => role.name === "Super Administrator") ||
          effectivePermissions(
            new Set(
              user.roles.flatMap(({ role }) =>
                role.permissions.map(({ permission }) => permission.key),
              ),
            ),
          ).has("laboratory.payments.create"),
      );
      if (!recipients.length)
        fail("No active accounting staff are available to notify.", 409);
      await tx.notification.createMany({
        data: recipients.map((user) => ({
          userId: user.id,
          reminderKey: `lab-patient:${id}:${user.id}`,
          type: "laboratory_patient_requested",
          title: "Laboratory is ready for the patient",
          body: `${actor} requests ticket ${String(order.queueNumber).padStart(3, "0")} (${order.queueDay}): ${order.patient.firstName} ${order.patient.lastName}. Please direct the patient to the laboratory room.`,
          route: `/laboratory/accounting?orderId=${id}`,
        })),
        skipDuplicates: true,
      });
      return order;
    }),
  queuePosition: async (id) => {
    const order = await prisma.laboratoryOrder.findUniqueOrThrow({
      where: { id },
      include,
    });
    const accounting = order.status === "awaiting_payment";
    const active = accounting
      ? order.invoice.balanceAmount > 0 &&
        !["draft", "cancelled"].includes(order.invoice.status)
      : ["waiting", "collecting", "processing"].includes(order.status) &&
        order.invoice.status === "paid";
    const ahead = active
      ? await prisma.laboratoryOrder.count({
          where: {
            status: accounting
              ? "awaiting_payment"
              : { in: ["waiting", "collecting", "processing"] },
            invoice: accounting
              ? {
                  status: { notIn: ["draft", "cancelled"] },
                  balanceAmount: { gt: 0 },
                }
              : { status: "paid" },
            OR: [
              { queueDay: { lt: order.queueDay } },
              {
                queueDay: order.queueDay,
                queueNumber: { lt: order.queueNumber },
              },
            ],
          },
        })
      : 0;
    return { ahead, active, queue: accounting ? "accounting" : "laboratory" };
  },
  accountingQueue: async () => {
    const where = {
      status: "awaiting_payment",
      invoice: {
        status: { notIn: ["draft", "cancelled"] },
        balanceAmount: { gt: 0 },
      },
    };
    const [tickets, total] = await Promise.all([
      prisma.laboratoryOrder.findMany({
        where,
        take: 100,
        orderBy: [{ queueDay: "asc" }, { queueNumber: "asc" }],
        include,
      }),
      prisma.laboratoryOrder.count({ where }),
    ]);
    return { tickets, total };
  },
  callAccountingTicket: (id, actor) =>
    prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM laboratory_Orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.laboratoryOrder.findUniqueOrThrow({
        where: { id },
        include,
      });
      if (
        order.status !== "awaiting_payment" ||
        order.invoice.balanceAmount <= 0 ||
        ["draft", "cancelled"].includes(order.invoice.status)
      )
        fail("This ticket is no longer awaiting accounting payment.", 409);
      return tx.laboratoryOrder.update({
        where: { id },
        data: { accountingCalledAt: new Date(), accountingCalledByName: actor },
        include,
      });
    }),
  dashboard: async (canPayments) => {
    const system = await getSettings("system");
    const today = queueDay(new Date(), system.timezone);
    const [
      stages,
      todayRequests,
      examinations,
      activeTests,
      patients,
      recent,
      currencies,
      methods,
    ] = await Promise.all([
      prisma.laboratoryOrder.groupBy({ by: ["status"], _count: true }),
      prisma.laboratoryOrder.count({ where: { queueDay: today } }),
      prisma.laboratoryOrderItem.groupBy({
        by: ["testName", "specimen"],
        where: { order: { invoice: { status: { not: "cancelled" } } } },
        _count: true,
        orderBy: { _count: { testName: "desc" } },
        take: 10,
      }),
      prisma.laboratoryTest.count({ where: { status: "active" } }),
      prisma.$queryRaw`SELECT COUNT(DISTINCT patientId) AS total FROM laboratory_Orders`,
      prisma.laboratoryOrder.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          patient: {
            select: { firstName: true, lastName: true, patientCode: true },
          },
        },
      }),
      canPayments
        ? prisma.billingInvoice.groupBy({
            by: ["currency"],
            where: {
              laboratoryOrder: { isNot: null },
              status: { not: "cancelled" },
            },
            _sum: { totalAmount: true, paidAmount: true, balanceAmount: true },
          })
        : [],
      canPayments
        ? prisma.$queryRaw`SELECT i.currency, p.method, SUM(p.amount) AS amount, COUNT(*) AS total FROM billing_BillingPayment p JOIN billing_BillingInvoice i ON i.id = p.invoiceId JOIN laboratory_Orders o ON o.invoiceId = i.id WHERE i.status <> 'cancelled' GROUP BY i.currency, p.method ORDER BY i.currency, p.method`
        : [],
    ]);
    return {
      today,
      stages: Object.fromEntries(stages.map((row) => [row.status, row._count])),
      todayRequests,
      activeTests,
      patients: Number(patients[0]?.total ?? 0),
      examinations: examinations.map((row) => ({
        name: row.testName,
        specimen: row.specimen,
        count: row._count,
      })),
      recent,
      currencies: currencies.map((row) => ({
        currency: row.currency,
        invoiced: row._sum.totalAmount ?? 0,
        paid: row._sum.paidAmount ?? 0,
        balance: row._sum.balanceAmount ?? 0,
      })),
      methods: methods.map((row) => ({
        ...row,
        amount: Number(row.amount),
        total: Number(row.total),
      })),
    };
  },
  overview: async () => {
    const rows = await prisma.laboratoryOrder.groupBy({
      by: ["status"],
      _count: true,
    });
    return Object.fromEntries(rows.map((row) => [row.status, row._count]));
  },
  config: async () => {
    const finance = await getSettings("finance");
    return {
      currency: finance.currency,
      paymentMethods: finance.paymentMethods,
    };
  },
  tests: (query) =>
    paginate(
      "laboratoryTest",
      { page: 1, pageSize: 20, ...query },
      { orderBy: { name: "asc" } },
      ["code", "name", "specimen"],
    ),
  createTest: (body) =>
    prisma.laboratoryTest.create({
      data: {
        ...testSchema.parse(body),
        code: `LAB-${randomUUID().toUpperCase()}`,
      },
    }),
  updateTest: (id, body) =>
    prisma.laboratoryTest.update({
      where: { id },
      data: testSchema.parse(body),
    }),
  deleteTest: (id) => prisma.laboratoryTest.delete({ where: { id } }),
  list: (query) => {
    const status = z
      .enum([
        "",
        "awaiting_payment",
        "waiting",
        "collecting",
        "processing",
        "completed",
        "received",
        "called",
        "delivered",
      ])
      .parse(query.status ?? "");
    const day = query.day ? z.iso.date().parse(query.day) : undefined;
    return paginate(
      "laboratoryOrder",
      { page: 1, pageSize: 20, ...query },
      {
        where: {
          ...(status && { status }),
          ...(query.resultsReady === "true" && {
            AND: [
              {
                status: {
                  in: ["completed", "received", "called", "delivered"],
                },
              },
            ],
          }),
          ...(day && { queueDay: day }),
          ...(query.patientId && { patientId: String(query.patientId) }),
          ...(query.leadId && {
            OR: [
              { leadId: String(query.leadId) },
              {
                patient: {
                  sourceLeads: { some: { id: String(query.leadId) } },
                },
              },
            ],
          }),
          ...(query.appointmentId && {
            appointmentId: String(query.appointmentId),
          }),
          ...(query.queue === "true" && {
            AND: [
              {
                status: {
                  in: ["waiting", "collecting", "processing"],
                },
              },
            ],
            invoice: { status: "paid" },
          }),
          ...(query.completed === "true" && { AND: [{ status: "completed" }] }),
          ...(query.received === "true" && {
            AND: [{ status: { in: ["received", "called", "delivered"] } }],
          }),
        },
        include,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      },
      [
        "patient.firstName",
        "patient.lastName",
        "patient.patientCode",
        "invoice.invoiceNumber",
      ],
    );
  },
  get: (id) =>
    prisma.laboratoryOrder.findUniqueOrThrow({ where: { id }, include }),
  create: async (body, actor) => {
    const input = orderSchema.parse(body);
    const [finance, system] = await Promise.all([
      getSettings("finance"),
      getSettings("system"),
    ]);
    try {
      return await createLaboratoryOrder(prisma, input, actor, {
        ...finance,
        timezone: system.timezone,
      });
    } catch (error) {
      if (error.code === "P2002") {
        const previous = await prisma.laboratoryOrder.findUnique({
          where: { requestId: input.requestId },
          include,
        });
        if (previous) return previous;
      }
      throw error;
    }
  },
  advance: (id, body, actor) =>
    advanceLaboratoryOrder(prisma, id, stageSchema.parse(body).status, actor),
  results: async (id, body) => {
    const input = resultsSchema.parse(body);
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM laboratory_Orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.laboratoryOrder.findUniqueOrThrow({
        where: { id },
        include,
      });
      if (order.status !== "processing" || order.invoice.status !== "paid")
        fail(
          "Results can only be edited for paid requests in processing.",
          409,
        );
      if (
        new Set(input.items.map((i) => i.id)).size !== input.items.length ||
        input.items.some((i) => !order.items.some((saved) => saved.id === i.id))
      )
        fail("Result items do not belong to this request.");
      for (const item of input.items)
        await tx.laboratoryOrderItem.update({
          where: { id: item.id },
          data: { result: item.result, resultNotes: item.resultNotes },
        });
      return tx.laboratoryOrder.findUniqueOrThrow({ where: { id }, include });
    });
  },
  pay: async (id, body) =>
    recordLaboratoryPayment(
      prisma,
      id,
      paymentSchema.parse(body),
      await getSettings("finance"),
    ),
  lookup: async (resource, query) => {
    const search = z
      .string()
      .trim()
      .max(191)
      .parse(query.search ?? "");
    const id = query.id ? String(query.id) : undefined;
    const contains = { contains: search };
    const args = { take: 20 };
    if (resource === "patients")
      return prisma.patient.findMany({
        ...args,
        where: id
          ? { id }
          : {
              OR: [
                { firstName: contains },
                { lastName: contains },
                { patientCode: contains },
                { phone: contains },
              ],
            },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          patientCode: true,
          phone: true,
          address: true,
        },
        orderBy: { firstName: "asc" },
      });
    if (resource === "leads")
      return prisma.crmLead.findMany({
        ...args,
        where: id
          ? { id }
          : {
              OR: [{ name: contains }, { phone: contains }, { code: contains }],
            },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          code: true,
          convertedPatientId: true,
        },
        orderBy: { name: "asc" },
      });
    if (resource === "appointments")
      return prisma.appointment.findMany({
        ...args,
        where: id
          ? { id }
          : {
              ...(query.phone && { patientPhone: String(query.phone) }),
              ...(search && { patientName: contains }),
            },
        select: {
          id: true,
          patientName: true,
          patientPhone: true,
          scheduledAt: true,
        },
        orderBy: { scheduledAt: "desc" },
      });
    if (resource === "tests")
      return prisma.laboratoryTest.findMany({
        ...args,
        where: {
          status: "active",
          ...(id ? { id } : { OR: [{ name: contains }, { code: contains }] }),
        },
        orderBy: { name: "asc" },
      });
    fail("Unknown laboratory lookup.", 404);
  },
};

export async function recordLaboratoryPayment(db, id, input, policy) {
  if (!policy.paymentMethods.includes(input.method))
    fail("This payment method is disabled in Settings.");
  const order = await db.laboratoryOrder.findUniqueOrThrow({ where: { id } });
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM billing_BillingInvoice WHERE id = ${order.invoiceId} FOR UPDATE`;
    const previous = await tx.laboratoryPaymentReceipt.findUnique({
      where: { requestId: input.requestId },
    });
    if (previous) {
      if (previous.orderId !== id)
        fail("Payment request belongs to another laboratory order.", 409);
      return tx.laboratoryOrder.findUniqueOrThrow({ where: { id }, include });
    }
    const payment = await createBillingPayment(
      tx,
      {
        invoiceId: order.invoiceId,
        amount: input.amount,
        method: input.method,
        reference: `LAB-${order.queueDay}-${order.queueNumber}`,
        notes: "Laboratory payment",
      },
      (invoice) => {
        if (["draft", "cancelled", "paid"].includes(invoice.status))
          fail("This invoice does not accept payments.", 409);
        if (
          Math.round(input.amount * 100) >
          Math.round(invoice.balanceAmount * 100)
        )
          fail("Payment exceeds invoice balance.");
      },
    );
    await tx.laboratoryPaymentReceipt.create({
      data: { requestId: input.requestId, orderId: id, paymentId: payment.id },
    });
    return tx.laboratoryOrder.findUniqueOrThrow({ where: { id }, include });
  });
}
