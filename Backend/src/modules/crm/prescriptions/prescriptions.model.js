import { prisma } from "../../../shared/database/client.js";
export const prescriptionsModel = {
  list: (patientId) =>
    prisma.patientPrescription.findMany({
      where: { patientId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
  patient: (id) =>
    prisma.patient.findUniqueOrThrow({
      where: { id },
      select: { firstName: true, lastName: true, patientCode: true },
    }),
  create: (data) =>
    prisma.patientPrescription.upsert({
      where: { requestId: data.requestId },
      create: data,
      update: {},
    }),
  findByRequestId: (requestId) =>
    prisma.patientPrescription.findUnique({ where: { requestId } }),
  products: (ids) =>
    prisma.inventoryProduct.findMany({
      where: { id: { in: ids }, status: "active" },
      select: { id: true, sellingPrice: true, unit: true },
    }),
  catalog: () =>
    prisma.inventoryProduct.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        sku: true,
        size: true,
        sellingPrice: true,
        unit: true,
        doseMgKgDay: true,
        dosesPerDay: true,
        concentrationMg: true,
        concentrationMl: true,
      },
      orderBy: { name: "asc" },
    }),
};
