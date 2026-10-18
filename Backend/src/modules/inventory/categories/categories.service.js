import { categoriesModel } from "./categories.model.js";
import { categorySchema } from "./categories.schema.js";
export const categoriesService = {
  list: async ({ query = {} }) => {
    return await categoriesModel.paginate(query, "productCategory", {
      orderBy: { name: "asc" },
    });
  },
  create: async ({ body }) => {
    return await categoriesModel.create({
      data: categorySchema.parse(body),
    });
  },
  update: async ({ body, id }) => {
    return await categoriesModel.update({
      where: { id: id },
      data: categorySchema.partial().parse(body),
    });
  },
  remove: async ({ id }) => {
    await categoriesModel.delete({ where: { id: id } });
    return undefined;
  },
};
