import {
  scopeWarehouseQuery,
  assignedWarehouse,
} from "../../../shared/security/warehouse-scope.js";
export const inventoryAction =
  (handler, status = 200) =>
  async (req, res, next) => {
    try {
      const result = await handler({
        query: scopeWarehouseQuery(req.user, req.query),
        warehouseScope: assignedWarehouse(req.user),
        body: req.body,
        id: req.params.id,
        files: req.files,
      });
      if (result === undefined) return res.status(204).end();
      return res.status(status).json(result);
    } catch (error) {
      next(error);
    }
  };
