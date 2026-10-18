import { createCrudService } from "../../../shared/services/crud.service.js";
import { verifySecret } from "../../../shared/security/password.js";
import { attendancePermissionModel } from "./attendance-permissions.model.js";
export const attendancePermissionService = {
  ...createCrudService(attendancePermissionModel),
  async create(data) {
    if (
      data.status === "approved" &&
      (await attendancePermissionModel.findApprovedOverlap(data))
    ) {
      throw Object.assign(
        new Error("This employee already has an approved permission for that date."),
        { status: 409 },
      );
    }
    return attendancePermissionModel.create(data);
  },
  async remove(id, user, password) {
    if (!user?.roles?.some(({ role }) => role.name === "Super Administrator"))
      throw Object.assign(
        new Error(
          "Only a Super Administrator can delete attendance permissions.",
        ),
        { status: 403 },
      );
    if (typeof password !== "string" || !password)
      throw Object.assign(
        new Error("Super Administrator password is required."),
        { status: 422 },
      );
    if (!(await verifySecret(password, user.passwordHash)))
      throw Object.assign(
        new Error("Super Administrator password is incorrect."),
        { status: 403 },
      );
    return attendancePermissionModel.remove(id);
  },
};
