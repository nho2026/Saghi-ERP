import { getSettings } from "../../settings/settings.service.js";
import { billingModel } from "./billing.model.js";
const httpError = (message, status) =>
  Object.assign(new Error(message), { status });
const cleanCustomer = (data) => ({
  ...data,
  ...(data.email !== undefined && { email: data.email || null }),
});
const totals = (input) => {
  const items = input.items.map((item) => {
    const base = item.quantity * item.unitPrice - item.discount;
    return { ...item, lineTotal: base + (base * item.taxRate) / 100 };
  });
  const subtotal = items.reduce((s, x) => s + x.quantity * x.unitPrice, 0),
    taxAmount = items.reduce(
      (s, x) => s + ((x.quantity * x.unitPrice - x.discount) * x.taxRate) / 100,
      0,
    ),
    totalAmount = Math.max(
      0,
      subtotal -
        input.discountAmount -
        items.reduce((s, x) => s + x.discount, 0) +
        taxAmount,
    );
  return { items, subtotal, taxAmount, totalAmount };
};
export const billingService = {
  listCustomers: billingModel.listCustomers,
  createCustomer: (data) => billingModel.createCustomer(cleanCustomer(data)),
  updateCustomer: (id, data) =>
    billingModel.updateCustomer(id, cleanCustomer(data)),
  deleteCustomer: billingModel.deleteCustomer,
  listInvoices: (status, query) =>
    billingModel.listInvoices(status ? String(status) : undefined, query),
  createInvoice: async (input) => {
    const policy = await getSettings("finance");
    const calculated = totals(input);
    return billingModel.createInvoice({
      customerId: input.customerId,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      currency: (input.currency ?? policy.currency).toUpperCase(),
      discountAmount: input.discountAmount,
      status: input.status,
      notes: input.notes,
      subtotal: calculated.subtotal,
      taxAmount: calculated.taxAmount,
      totalAmount: calculated.totalAmount,
      balanceAmount: calculated.totalAmount,
      items: { create: calculated.items },
    });
  },
  async updateInvoiceStatus(id, status) {
    const current = await billingModel.findInvoice(id);
    if (current.paidAmount > 0 && status === "cancelled")
      throw httpError("A paid invoice cannot be cancelled.", 400);
    return billingModel.updateInvoiceStatus(current.id, status);
  },
  deleteInvoice: billingModel.deleteDraftInvoice,
  listPayments: billingModel.listPayments,
  async recordPayment(data) {
    const policy = await getSettings("finance");
    if (!policy.paymentMethods.includes(data.method))
      throw httpError("This payment method is disabled in Settings.", 400);
    return billingModel.recordPayment(data, (invoice) => {
      if (["draft", "cancelled"].includes(invoice.status))
        throw httpError(
          "Payments can only be recorded against an active invoice.",
          400,
        );
      if (data.amount > invoice.balanceAmount + 0.001)
        throw httpError("Payment exceeds the invoice balance.", 400);
    });
  },
};
