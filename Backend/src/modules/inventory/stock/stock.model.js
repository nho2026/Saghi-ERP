import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const stockModel = {
  paginate,
  lowStockWhere: () => ({
    OR: [
      { quantity: { lte: 0 } },
      { quantity: { lte: prisma.inventoryStock.fields.reorderLevel } },
    ],
  }),
  summary: () => prisma.$queryRaw`
    SELECT warehouseId, COUNT(*) AS total, COALESCE(SUM(quantity), 0) AS units,
      SUM(CASE WHEN quantity <= 0 THEN 1 ELSE 0 END) AS emptyCount,
      SUM(CASE WHEN quantity > 0 AND quantity <= reorderLevel THEN 1 ELSE 0 END) AS low
    FROM inventory_InventoryStock
    GROUP BY warehouseId
  `,
  $transaction: (...args) => prisma.$transaction(...args),
};
