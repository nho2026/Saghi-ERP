import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export function createDirectoryModel(model) {
  return {
    list: (query, args) => paginate(query, model, args),
    create: (args) => prisma[model].create(args),
    update: (args) => prisma[model].update(args),
    delete: (args) => prisma[model].delete(args),
  };
}
