import { paginate } from "../../../shared/database/paginate.js";
import {
  createWithCode,
  withoutCode,
} from "../../../shared/database/automatic-code.js";
import { defaults } from "../../settings/settings.schema.js";
import { prisma } from "../../../shared/database/client.js";
const invoiceInclude = {
  customer: true,
  items: true,
  payments: { orderBy: { paidAt: "desc" } },
};
export const billingModel = {
  listCustomers: (query = {}) =>
    paginate(
      "billingCustomer",
      query,
      {
        include: { _count: { select: { invoices: true } } },
        orderBy: { name: "asc" },
      },
      ["code", "name", "phone", "email"],
    ),
  createCustomer: (data) =>
    createWithCode(prisma.billingCustomer, { data }, "CUS"),
  updateCustomer: (id, data) =>
    prisma.billingCustomer.update({ where: { id }, data: withoutCode(data) }),
  deleteCustomer: (id) => prisma.billingCustomer.delete({ where: { id } }),
  listInvoices: (status, query = {}) =>
    paginate(
      "billingInvoice",
      query,
      {
        where: status ? { status } : {},
        include: invoiceInclude,
        orderBy: { issueDate: "desc" },
        take: 1000,
      },
      ["invoiceNumber", "customer.name"],
    ),
  createInvoice: (data) =>
    prisma.$transaction((tx) => createBillingInvoice(tx, data)),
  findInvoice: (id) =>
    prisma.billingInvoice.findUniqueOrThrow({ where: { id } }),
  updateInvoiceStatus: (id, status) =>
    prisma.billingInvoice.update({
      where: { id },
      data: { status },
      include: invoiceInclude,
    }),
  deleteDraftInvoice: (id) =>
    prisma.billingInvoice.delete({
      where: { id, status: "draft", paidAmount: 0 },
    }),
  listPayments: (query = {}) =>
    paginate(
      "billingPayment",
      query,
      {
        include: { invoice: { include: { customer: true } } },
        orderBy: { paidAt: "desc" },
        take: 1000,
      },
      ["reference", "invoice.invoiceNumber", "invoice.customer.name"],
    ),
  recordPayment: (data, validate) =>
    prisma.$transaction((tx) => createBillingPayment(tx, data, validate)),
};

export async function createBillingInvoice(tx, data) {
  await tx.systemSetting.upsert({
    where: { category: "finance" },
    create: { category: "finance", value: defaults.finance },
    update: {},
  });
  await tx.$queryRaw`SELECT category FROM system_Settings WHERE category = 'finance' FOR UPDATE`;
  const row = await tx.systemSetting.findUniqueOrThrow({
    where: { category: "finance" },
  });
  const policy = { ...defaults.finance, ...row.value };
  const invoiceNumber = `${policy.invoicePrefix}-${String(policy.invoiceNextNumber).padStart(6, "0")}`;
  const invoice = await tx.billingInvoice.create({
    data: { ...data, invoiceNumber },
    include: invoiceInclude,
  });
  await tx.systemSetting.update({
    where: { category: "finance" },
    data: {
      value: { ...policy, invoiceNextNumber: policy.invoiceNextNumber + 1 },
    },
  });
  return invoice;
}

export async function createBillingPayment(tx, data, validate) {
  await tx.$queryRaw`SELECT id FROM billing_BillingInvoice WHERE id = ${data.invoiceId} FOR UPDATE`;
  const invoice = await tx.billingInvoice.findUniqueOrThrow({
    where: { id: data.invoiceId },
  });
  validate(invoice);
  const payment = await tx.billingPayment.create({ data });
  const paidAmount = Math.round((invoice.paidAmount + data.amount) * 100) / 100,
    balanceAmount = Math.max(0, invoice.totalAmount - paidAmount);
  await tx.billingInvoice.update({
    where: { id: invoice.id },
    data: {
      paidAmount,
      balanceAmount,
      status: balanceAmount <= 0.001 ? "paid" : "partial",
    },
  });
  if (balanceAmount <= 0.001) {
    await tx.laboratoryOrder.updateMany({
      where: { invoiceId: invoice.id, status: "awaiting_payment" },
      data: { status: "waiting" },
    });
  }
  return payment;
}
