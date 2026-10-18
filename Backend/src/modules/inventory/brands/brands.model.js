import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const brandsModel = {
  paginate,
  create: (...args) => prisma.productBrand.create(...args),
  delete: (...args) => prisma.productBrand.delete(...args),
  update: (...args) => prisma.productBrand.update(...args),
};
