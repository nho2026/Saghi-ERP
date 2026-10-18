import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const retailersModel = {
  paginate,
  create: (...args) => prisma.inventoryRetailer.create(...args),
  update: (...args) => prisma.inventoryRetailer.update(...args),
  delete: (...args) => prisma.inventoryRetailer.delete(...args),
};
