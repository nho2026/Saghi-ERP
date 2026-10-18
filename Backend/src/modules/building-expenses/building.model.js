import { prisma } from "../../shared/database/client.js";

const db = (client) => client ?? prisma;

export const buildingModel = {
  async overview() {
    const [departments, products, allocations, expenses, requests] =
      await Promise.all([
        prisma.department.findMany({
          where: { status: "active" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.buildingProduct.findMany({ orderBy: { name: "asc" } }),
        prisma.buildingDepartmentProduct.findMany({
          include: { product: true, department: true },
        }),
        prisma.buildingExpense.findMany({
          include: { department: true },
          orderBy: { date: "desc" },
        }),
        prisma.buildingRequest.findMany({
          include: { department: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);
    return { departments, products, allocations, expenses, requests };
  },
  findActiveDepartment: (id, client) =>
    db(client).department.findFirst({ where: { id, status: "active" } }),
  findActiveProduct: (id, client) =>
    db(client).buildingProduct.findFirst({ where: { id, active: true } }),
  createProduct: (data) => prisma.buildingProduct.create({ data }),
  updateProduct: (id, data) =>
    prisma.buildingProduct.update({ where: { id }, data }),
  async updateAllocation(id, quantity, previousQuantity) {
    const result = await prisma.buildingDepartmentProduct.updateMany({
      where: { id, quantity: previousQuantity },
      data: { quantity },
    });
    return result.count;
  },
  createExpense: (data) => prisma.buildingExpense.create({ data }),
  updateExpense: (id, data) =>
    prisma.buildingExpense.update({ where: { id }, data }),
  createRequest: (data) => prisma.buildingRequest.create({ data }),
  findRequest: (id, client) =>
    db(client).buildingRequest.findUnique({ where: { id } }),
  async addPayment(id, amount, paymentMethod, user) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.buildingRequest.findUnique({ where: { id } });
      if (!request) return { kind: "missing" };
      if (request.status !== "completed") return { kind: "not-completed" };
      const paid =
        Math.round(Number(request.paidAmount) * 100) +
        Math.round(amount * 100);
      const total = request.items.reduce(
        (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
        0,
      );
      if (paid > total) return { kind: "overpaid" };
      const result = await tx.buildingRequest.updateMany({
        where: {
          id: request.id,
          paidAmount: request.paidAmount,
          status: "completed",
        },
        data: {
          paidAmount: paid / 100,
          paymentMethod,
          history: [
            ...request.history,
            {
              status: "payment",
              by: user,
              at: new Date().toISOString(),
              reason: `${amount} (${paymentMethod})`,
            },
          ],
        },
      });
      return result.count ? { kind: "ok" } : { kind: "changed" };
    });
  },
  async updateDraft(id, data) {
    const result = await prisma.buildingRequest.updateMany({
      where: { id, status: "draft" },
      data,
    });
    return result.count;
  },
  async submitRequest(id, user) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.buildingRequest.findUnique({ where: { id } });
      if (!request || request.status !== "draft") return false;
      const result = await tx.buildingRequest.updateMany({
        where: { id: request.id, status: "draft" },
        data: {
          status: "pending",
          history: [
            ...request.history,
            {
              status: "pending",
              by: user,
              at: new Date().toISOString(),
              reason: "Submitted for approval",
            },
          ],
        },
      });
      return result.count > 0;
    });
  },
  async updateRequestStatus(id, expectedStatus, status, reason, user) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.buildingRequest.findUnique({ where: { id } });
      if (!request) return { kind: "missing" };
      if (request.status !== expectedStatus) return { kind: "changed" };
      const result = await tx.buildingRequest.updateMany({
        where: { id: request.id, status: expectedStatus },
        data: {
          status,
          history: [
            ...request.history,
            { status, reason, by: user, at: new Date().toISOString() },
          ],
        },
      });
      if (!result.count) return { kind: "changed" };
      if (status === "completed") {
        for (const item of request.items) {
          if (!item.productId) continue;
          await tx.buildingDepartmentProduct.upsert({
            where: {
              departmentId_productId: {
                departmentId: request.departmentId,
                productId: item.productId,
              },
            },
            create: {
              departmentId: request.departmentId,
              productId: item.productId,
              quantity: item.quantity,
            },
            update: { quantity: { increment: item.quantity } },
          });
        }
      }
      return { kind: "ok" };
    });
  },
};
