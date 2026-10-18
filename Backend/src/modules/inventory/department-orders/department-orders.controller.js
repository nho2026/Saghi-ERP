import { departmentOrdersModel as model } from "./department-orders.model.js";
import { inventoryAction } from "../shared/inventory.controller.js";
import { departmentOrdersService as service } from "./department-orders.service.js";
const departmentId = (req) => {
  const id = req.user.employee?.departmentId;
  if (!id)
    throw Object.assign(
      new Error("Your employee account must be assigned to a department."),
      { status: 403 },
    );
  return id;
};
export const departmentOrdersController = {
  myCatalog: async (req, res, next) => {
    try {
      departmentId(req);
      res.json(await model.catalog());
    } catch (error) {
      next(error);
    }
  },
  myList: async (req, res, next) => {
    try {
      res.json(
        await service.list({
          query: { ...req.query, departmentId: departmentId(req) },
        }),
      );
    } catch (error) {
      next(error);
    }
  },
  myCreate: async (req, res, next) => {
    try {
      res
        .status(201)
        .json(
          await service.create({
            body: { ...req.body, departmentId: departmentId(req) },
          }),
        );
    } catch (error) {
      next(error);
    }
  },
  myCancel: async (req, res, next) => {
    try {
      res.json(
        await model.requestAction(req.params.id, departmentId(req), "cancel"),
      );
    } catch (error) {
      next(error);
    }
  },
  myRemind: async (req, res, next) => {
    try {
      res.json(
        await model.requestAction(req.params.id, departmentId(req), "remind"),
      );
    } catch (error) {
      next(error);
    }
  },
  list: inventoryAction(service.list),
  departments: inventoryAction(service.departments),
  create: inventoryAction(service.create, 201),
  update: inventoryAction(service.update),
  comments: inventoryAction(service.comments),
  comment: inventoryAction(service.comment, 201),
};
