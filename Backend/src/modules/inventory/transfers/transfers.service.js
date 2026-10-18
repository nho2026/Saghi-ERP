import { transfersSchema } from "./transfers.schema.js";
import { transfersModel } from "./transfers.model.js";
export const transfersService = {
  list: ({ query = {} }) => transfersModel.list(query),
  create: ({ body }) => transfersModel.create(transfersSchema.parse(body)),
};
