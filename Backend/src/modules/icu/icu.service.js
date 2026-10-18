import { prisma } from "../../shared/database/client.js";
import { listIcuCases } from "../inventory/stock/icu-list.js";
import {
  createReduction,
  listReductions,
} from "../inventory/stock/reductions.service.js";
import { listStorage } from "../inventory/stock/storage.service.js";

const icuWarehouse = () =>
  prisma.inventoryWarehouse.findFirst({
    where: { name: { contains: "icu" }, status: "active" },
    select: { id: true, name: true },
  });

export const icuService = {
  async dashboard() {
    const [activeCases, totalCases, staff, operations, warehouse] =
      await Promise.all([
        prisma.inventoryIcuCase.count({ where: { unit: "icu", exit: null } }),
        prisma.inventoryIcuCase.count({ where: { unit: "icu" } }),
        prisma.healthStaff.count({
          where: {
            status: "active",
            department: { name: { contains: "icu" } },
          },
        }),
        prisma.icuOperationType.count({ where: { status: "active" } }),
        icuWarehouse(),
      ]);
    return { activeCases, totalCases, staff, operations, warehouse };
  },

  async cases(query) {
    const result = await listIcuCases("icu", query);
    if (Array.isArray(result)) return result;
    const { totals: _warehouseOnlyTotals, ...casesPage } = result;
    return casesPage;
  },

  async staff() {
    const department = await prisma.department.findFirst({
      where: { name: { contains: "icu" }, status: "active" },
      select: { id: true, name: true },
    });
    const items = department
      ? await prisma.healthStaff.findMany({
          where: { departmentId: department.id },
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeCode: true,
                position: { select: { name: true } },
              },
            },
          },
          orderBy: { employee: { firstName: "asc" } },
        })
      : [];
    return { department, items };
  },

  operationTypes: () =>
    prisma.icuOperationType.findMany({ orderBy: { name: "asc" } }),
  createOperationType: (data) => prisma.icuOperationType.create({ data }),
  updateOperationType: (id, data) =>
    prisma.icuOperationType.update({ where: { id }, data }),

  async storage() {
    const warehouse = await icuWarehouse();
    const items = warehouse
      ? await prisma.inventoryStock.findMany({
          where: { warehouseId: warehouse.id },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { product: { name: "asc" } },
        })
      : [];
    return { warehouse, items };
  },

  async products(query) {
    const warehouse = await icuWarehouse();
    return warehouse
      ? listStorage({ query: { ...query, warehouseId: warehouse.id } })
      : {
          items: [],
          pagination: { page: 1, pageSize: 30, total: 0, totalPages: 0 },
          totals: { products: 0, quantity: 0, buy: 0, sell: 0 },
        };
  },

  async itemReductions(query) {
    const warehouse = await icuWarehouse();
    return warehouse
      ? listReductions({ query: { ...query, warehouseId: warehouse.id } })
      : {
          items: [],
          pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
        };
  },

  async createItemReduction(data) {
    const warehouse = await icuWarehouse();
    if (!warehouse)
      throw Object.assign(
        new Error("Create an active ICU warehouse before reducing stock."),
        { status: 409 },
      );
    return createReduction({ body: { ...data, warehouseId: warehouse.id } });
  },
};
