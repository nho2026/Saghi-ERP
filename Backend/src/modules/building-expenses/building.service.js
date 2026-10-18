import { buildingModel } from "./building.model.js";
import {
  allocationSchema,
  expenseSchema,
  paymentSchema,
  productSchema,
  requestSchema,
  requestStatusSchema,
  validateTransition,
} from "./building.schema.js";

const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};

async function activeDepartment(id, client) {
  if (!(await buildingModel.findActiveDepartment(id, client)))
    fail("Select an active department.");
}

async function prepareRequest(body, client) {
  const data = requestSchema.parse(body);
  if (data.kind !== "purchase") {
    data.invoiceNumber = null;
    data.attachmentUrl = null;
  }
  await activeDepartment(data.departmentId, client);
  for (const item of data.items) {
    if (!item.productId) {
      if (data.kind === "sale")
        fail("Department sales require a catalog product.");
      continue;
    }
    const product = await buildingModel.findActiveProduct(
      item.productId,
      client,
    );
    if (!product) fail("A selected product is unavailable.");
    item.name = product.name;
  }
  const total = data.items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  );
  if (Math.round(data.paidAmount * 100) > total)
    fail("Payment cannot exceed the total.");
  return data;
}

export const buildingService = {
  overview: () => buildingModel.overview(),
  createProduct: (body) =>
    buildingModel.createProduct(productSchema.parse(body)),
  updateProduct: (id, body) =>
    buildingModel.updateProduct(id, productSchema.parse(body)),
  async updateAllocation(id, body) {
    const { quantity, previousQuantity } = allocationSchema.parse(body);
    if (!(await buildingModel.updateAllocation(id, quantity, previousQuantity)))
      fail("Department quantity changed. Refresh and try again.", 409);
    return { success: true };
  },
  async createExpense(body, user) {
    const data = expenseSchema.parse(body);
    await activeDepartment(data.departmentId);
    return buildingModel.createExpense({
      ...data,
      date: new Date(data.date),
      createdBy: user.name,
    });
  },
  async updateExpense(id, body) {
    const data = expenseSchema.parse(body);
    await activeDepartment(data.departmentId);
    return buildingModel.updateExpense(id, {
      ...data,
      date: new Date(data.date),
    });
  },
  async createRequest(body, user) {
    const data = await prepareRequest(body);
    return buildingModel.createRequest({
      ...data,
      createdBy: user.name,
      history: [
        {
          status: "draft",
          by: user.name,
          at: new Date().toISOString(),
          reason: "",
        },
      ],
    });
  },
  async recordPayment(id, body, user) {
    const input = paymentSchema.parse(body);
    const result = await buildingModel.addPayment(
      id,
      input.amount,
      input.paymentMethod,
      user.name,
    );
    if (result.kind === "missing") fail("Request not found.", 404);
    if (result.kind === "not-completed")
      fail("Record additional payments after completion.", 409);
    if (result.kind === "overpaid")
      fail("Payment exceeds the outstanding balance.");
    if (result.kind === "changed")
      fail("Payment changed. Refresh and try again.", 409);
    return { success: true };
  },
  async updateDraft(id, body) {
    const data = await prepareRequest(body);
    if (!(await buildingModel.updateDraft(id, data)))
      fail("Only a draft request can be edited.", 409);
    return { success: true };
  },
  async submitRequest(id, user) {
    if (!(await buildingModel.submitRequest(id, user.name)))
      fail("Only drafts can be submitted.", 409);
    return { success: true };
  },
  async updateRequestStatus(id, body, user) {
    const { status, reason } = requestStatusSchema.parse(body);
    const request = await buildingModel.findRequest(id);
    if (!request) fail("Request not found.", 404);
    validateTransition(request.status, status, request.kind, reason);
    const result = await buildingModel.updateRequestStatus(
      id,
      request.status,
      status,
      reason,
      user.name,
    );
    if (result.kind === "changed")
      fail("This request changed. Refresh and try again.", 409);
    if (result.kind === "missing") fail("Request not found.", 404);
    return { success: true };
  },
};
