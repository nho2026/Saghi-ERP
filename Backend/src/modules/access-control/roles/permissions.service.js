import { permissionModel } from "./permissions.model.js";
export const permissionService = {
  list: () => permissionModel.findAll(),
};
