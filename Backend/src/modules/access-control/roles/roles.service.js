import { mapPage } from "../../../shared/database/paginate.js";
import { roleModel } from "./roles.model.js";
import { presentRole } from "./roles.presenter.js";
const presentAll = async (promise) => mapPage(await promise, presentRole);
export const roleService = {
  list: (query) => presentAll(roleModel.findAll(query)),
  create: async (data) => presentRole(await roleModel.create(data)),
  update: async (id, data) => presentRole(await roleModel.update(id, data)),
  assignPermissions: async (id, ids) =>
    presentRole(await roleModel.assignPermissions(id, ids)),
  async remove(id) {
    const role = await roleModel.findById(id);
    if (role?.name === "Administrator")
      throw Object.assign(
        new Error("The Administrator role cannot be deleted."),
        { status: 400 },
      );
    await roleModel.remove(id);
  },
};
