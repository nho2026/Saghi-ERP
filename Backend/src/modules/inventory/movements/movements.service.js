import { movementsModel } from "./movements.model.js";
export const movementsService = {
  list: async ({ query = {} }) => {
    return await movementsModel.paginate(query, "inventoryMovement", {
      include: { product: true, warehouse: true },
      orderBy: { occurredAt: "desc" },
    });
  },
};
