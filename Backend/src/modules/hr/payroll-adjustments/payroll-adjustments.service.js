import { payrollAdjustmentModel } from "./payroll-adjustments.model.js";

export const payrollAdjustmentData = (data) => {
  const appliedAt = new Date();
  return {
    ...data,
    year: appliedAt.getFullYear(),
    month: appliedAt.getMonth() + 1,
    appliedAt,
  };
};

export const payrollAdjustmentService = {
  list: (query) => payrollAdjustmentModel.findAll(query),
  create: (data) => payrollAdjustmentModel.create(payrollAdjustmentData(data)),
  update: (id, data) => payrollAdjustmentModel.update(id, data),
  remove: (id) => payrollAdjustmentModel.remove(id),
};
