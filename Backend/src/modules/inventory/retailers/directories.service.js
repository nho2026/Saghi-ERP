import { createDirectoryModel } from "./directories.model.js";
export function createDirectoryService({ model, fields, schema }) {
  const directoryModel = createDirectoryModel(model);
  return {
    list: async ({ query = {} }) =>
      directoryModel.list(query, {
        where: query.search
          ? {
              OR: fields.map((field) => ({
                [field]: { contains: String(query.search).trim() },
              })),
            }
          : {},
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
    create: async ({ body }) =>
      directoryModel.create({ data: schema.parse(body) }),
    update: async ({ id, body }) =>
      directoryModel.update({ where: { id }, data: schema.parse(body) }),
    remove: async ({ id }) => {
      await directoryModel.delete({ where: { id } });
    },
  };
}
