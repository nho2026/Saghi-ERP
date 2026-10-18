import { retailersModel } from "./retailers.model.js";
import { retailerSchema } from "./retailers.schema.js";
export const retailersService = {
  list: async ({ query = {} }) =>
    retailersModel.paginate(query, "inventoryRetailer", {
      where: query.search
        ? {
            OR: ["name", "phone", "email"].map((field) => ({
              [field]: { contains: String(query.search).trim() },
            })),
          }
        : {},
      orderBy: [{ name: "asc" }, { id: "asc" }],
    }),
  create: async ({ body }) =>
    retailersModel.create({ data: retailerSchema.parse(body) }),
  update: async ({ id, body }) =>
    retailersModel.update({ where: { id }, data: retailerSchema.parse(body) }),
  remove: async ({ id }) => {
    await retailersModel.delete({ where: { id } });
  },
};
