import { healthcareModel as model } from "./healthcare.model.js";
const requireHospital = async (departmentId) => {
  if (!departmentId) return;
  const department = await model.getDepartment(departmentId);
  if (!department || department.type !== "hospital")
    throw Object.assign(
      new Error("Clinical staff must belong to a Hospital department."),
      { status: 400 },
    );
};
export const healthcareService = {
  listDepartments: model.listDepartments,
  async createDepartment(data) {
    const item = await model.createDepartment(data);
    if (data.managerId) await model.assignDepartment(data.managerId, item.id);
    return item;
  },
  async updateDepartment(id, data) {
    const { code: _code, ...changes } = data;
    const item = await model.updateDepartment(id, changes);
    if (data.managerId) await model.assignDepartment(data.managerId, item.id);
    return item;
  },
  removeDepartment: model.removeDepartment,
  removeDepartments: model.removeDepartments,
  listStaff: model.listStaff,
  async createStaff(data) {
    await requireHospital(data.departmentId);
    const item = await model.createStaff(data);
    if (data.departmentId)
      await model.assignDepartment(data.employeeId, data.departmentId);
    return item;
  },
  async updateStaff(id, data) {
    const current = await model.getStaff(id);
    if (
      data.departmentId !== undefined &&
      data.departmentId !== current.departmentId
    ) {
      await requireHospital(data.departmentId);
    }
    const item = await model.updateStaff(id, data);
    if (data.departmentId)
      await model.assignDepartment(item.employeeId, data.departmentId);
    return item;
  },
  removeStaff: model.removeStaff,
  publicDepartments: model.publicDepartments,
  publicDoctors: model.publicDoctors,
};
