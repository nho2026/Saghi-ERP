import { mapPage } from "../../../shared/database/paginate.js";
import { hashSecret, verifySecret } from "../../../shared/security/password.js";
import { createPinLookup } from "../../../shared/security/token.js";
import { presentUser } from "../../auth/auth.presenter.js";
import { userModel } from "./users.model.js";
import { clearUserLoginAttempts } from "../../auth/login-lockout.js";
async function storageAssignment(department, warehouseId) {
  if (!(await userModel.isHospitalDepartment(department))) {
    if (warehouseId)
      throw Object.assign(
        new Error(
          "Storage can only be assigned to users in an active hospital department.",
        ),
        { status: 400 },
      );
    return null;
  }
  if (!warehouseId) return null;
  const warehouse = await userModel.findWarehouse(warehouseId);
  if (!warehouse || warehouse.status !== "active")
    throw Object.assign(new Error("Choose an active storage."), {
      status: 400,
    });
  return warehouseId;
}
const forbidden = (message, status = 400) =>
  Object.assign(new Error(message), { status });
export const userService = {
  async list(query) {
    return mapPage(await userModel.findAll(query), presentUser);
  },
  async create({ roleIds, pin, password, warehouseId, ...data }) {
    const assignedWarehouseId = await storageAssignment(
      data.department,
      warehouseId,
    );
    if (pin && !(await userModel.hasSuperadminRole(roleIds)))
      throw forbidden("Only superadmins can have a login PIN.");
    return presentUser(
      await userModel.create({
        ...data,
        warehouseId: assignedWarehouseId,
        passwordHash: await hashSecret(password),
        pinHash: pin ? await hashSecret(pin) : null,
        pinLookup: pin ? createPinLookup(pin) : null,
        roles: { create: roleIds.map((roleId) => ({ roleId })) },
      }),
    );
  },
  async update(id, { roleIds, pin, password, warehouseId, ...data }) {
    if (warehouseId !== undefined || data.department !== undefined) {
      const current = await userModel.findById(id);
      const nextDepartment = data.department ?? current.department;
      const eligible = await userModel.isHospitalDepartment(nextDepartment);
      data.warehouseId = await storageAssignment(
        nextDepartment,
        eligible
          ? warehouseId === undefined
            ? current.warehouseId
            : warehouseId
          : warehouseId,
      );
    }
    const superadmin = roleIds
      ? await userModel.hasSuperadminRole(roleIds)
      : (await userModel.findById(id)).roles.some(
          ({ role }) => role.name === "Super Administrator",
        );
    if (pin && !superadmin)
      throw forbidden("Only superadmins can have a login PIN.");
    const update = { ...data };
    if (password) update.passwordHash = await hashSecret(password);
    if (pin !== undefined) {
      update.pinHash = pin ? await hashSecret(pin) : null;
      update.pinLookup = pin ? createPinLookup(pin) : null;
    }
    if (!superadmin) {
      update.pinHash = null;
      update.pinLookup = null;
    }
    if (roleIds)
      update.roles = {
        deleteMany: {},
        create: roleIds.map((roleId) => ({ roleId })),
      };
    return presentUser(await userModel.update(id, update));
  },
  async remove(id, currentId) {
    if (id === currentId)
      throw forbidden("You cannot delete your own account.");
    await userModel.remove(id, currentId);
  },
  async unlockAttempts(id) {
    await userModel.findById(id);
    await clearUserLoginAttempts(id);
  },
  async changePassword(id, currentUser, input) {
    if (id !== currentUser.id) throw forbidden("Forbidden.", 403);
    if (!(await verifySecret(input.currentPassword, currentUser.passwordHash)))
      throw forbidden("Current password is incorrect.");
    await userModel.updatePassword(id, await hashSecret(input.newPassword));
  },
};
