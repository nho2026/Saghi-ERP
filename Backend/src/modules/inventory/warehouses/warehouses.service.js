import { warehousesModel } from "./warehouses.model.js";
import { warehouseSchema } from "./warehouses.schema.js";
export const warehousesService = {
  list: async ({ query = {}, warehouseScope }) => {
    return await warehousesModel.paginate(query, "inventoryWarehouse", {
      ...(warehouseScope && {
        where: { id: warehouseScope, status: "active" },
      }),
      orderBy: { name: "asc" },
    });
  },
  create: async ({ body }) => {
    return await warehousesModel.create({
      data: warehouseSchema.parse(body),
    });
  },
  update: async ({ body, id }) => {
    return await warehousesModel.update({
      where: { id: id },
      data: warehouseSchema.partial().parse(body),
    });
  },
  remove: async ({ id }) => {
    await warehousesModel.delete({ where: { id: id } });
    return undefined;
  },
};
