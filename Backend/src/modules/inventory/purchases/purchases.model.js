import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const purchasesModel = {
  paginate,
  aggregate: (...args) => prisma.inventoryPurchase.aggregate(...args),
  count: (...args) => prisma.inventoryPurchase.count(...args),
  fields: prisma.inventoryPurchase.fields,
  findMany: (...args) => prisma.inventoryPurchase.findMany(...args),
  findUnique: (...args) => prisma.inventoryPurchase.findUnique(...args),
  findPayment: (...args) => prisma.inventoryPurchasePayment.findUnique(...args),
  $transaction: (...args) => prisma.$transaction(...args),
};
