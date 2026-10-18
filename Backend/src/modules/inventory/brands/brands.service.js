import { brandsModel } from "./brands.model.js";
import { brandSchema } from "./brands.schema.js";
export const brandsService = {
  list: async ({ query = {} }) => {
    return await brandsModel.paginate(query, "productBrand", {
      orderBy: { name: "asc" },
    });
  },
  create: async ({ body }) => {
    return await brandsModel.create({ data: brandSchema.parse(body) });
  },
  update: async ({ body, id }) => {
    return await brandsModel.update({
      where: { id: id },
      data: brandSchema.partial().parse(body),
    });
  },
  remove: async ({ id }) => {
    await brandsModel.delete({ where: { id: id } });
    return undefined;
  },
};
