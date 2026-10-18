import {
  createWithCode,
  withoutCode,
} from "../../shared/database/automatic-code.js";
import { prisma } from "../../shared/database/client.js";
const include = {
  product: { select: { id: true, sku: true, name: true } },
  service: { select: { id: true, code: true, name: true } },
};
export const feedbackModel = {
  async page(where, page, pageSize) {
    const [items, total] = await prisma.$transaction([
      prisma.feedback.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.feedback.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },
  create: (data) => prisma.feedback.create({ data, include }),
  updateStatus: (id, status) =>
    prisma.feedback.update({ where: { id }, data: { status }, include }),
  remove: (id) => prisma.feedback.delete({ where: { id } }),
  products: () =>
    prisma.inventoryProduct.findMany({
      where: { status: "active" },
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" },
    }),
  services: () =>
    prisma.healthcareService.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    }),
  allServices: () =>
    prisma.healthcareService.findMany({ orderBy: { name: "asc" } }),
  createService: (data) =>
    createWithCode(prisma.healthcareService, { data }, "SRV"),
  updateService: (id, data) =>
    prisma.healthcareService.update({ where: { id }, data: withoutCode(data) }),
  removeService: (id) => prisma.healthcareService.delete({ where: { id } }),
  async summaries() {
    const approved = await prisma.feedback.findMany({
      where: { status: "approved" },
      select: {
        targetType: true,
        productId: true,
        serviceId: true,
        rating: true,
        product: { select: { name: true } },
        service: { select: { name: true } },
      },
    });
    return approved;
  },
};
