import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const categoriesModel = {
  paginate,
  create: (...args) => prisma.productCategory.create(...args),
  delete: (...args) => prisma.productCategory.delete(...args),
  update: (...args) => prisma.productCategory.update(...args),
};
