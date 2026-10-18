import {
  createWithCode,
  withoutCode,
} from "../../../shared/database/automatic-code.js";
import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const warehousesModel = {
  paginate,
  create: (args) => createWithCode(prisma.inventoryWarehouse, args, "WH"),
  delete: (...args) => prisma.inventoryWarehouse.delete(...args),
  update: (args) =>
    prisma.inventoryWarehouse.update({ ...args, data: withoutCode(args.data) }),
};
