import { advancesModel } from "./advances.model.js";
import {
  salaryAdvanceSchema,
  serviceAdvanceSchema,
} from "./advances.schema.js";

const httpError = (message, status) =>
  Object.assign(new Error(message), { status });
const salaryData = (data) => {
  if (data.deductedAmount > data.amount)
    throw httpError("Deducted amount cannot exceed the salary advance.", 400);
  const remainingAmount = data.amount - data.deductedAmount;
  return {
    ...data,
    currency: data.currency.toUpperCase(),
    remainingAmount,
    status: remainingAmount <= 0 ? "completed" : data.status,
  };
};
const serviceData = (data) => {
  if (data.appliedAmount > data.amount)
    throw httpError("Applied amount cannot exceed the service advance.", 400);
  const balanceAmount = data.amount - data.appliedAmount;
  return {
    ...data,
    currency: data.currency.toUpperCase(),
    balanceAmount,
    status:
      balanceAmount <= 0
        ? "applied"
        : data.appliedAmount > 0
          ? "partially_applied"
          : data.status,
  };
};

export const advancesService = {
  listSalary: advancesModel.listSalary,
  createSalary: (data) => advancesModel.createSalary(salaryData(data)),
  async updateSalary(id, changes) {
    const current = await advancesModel.findSalary(id);
    const merged = salaryAdvanceSchema.parse({ ...current, ...changes });
    return advancesModel.updateSalary(id, salaryData(merged));
  },
  deleteSalary: advancesModel.deleteSalary,
  listService: advancesModel.listService,
  createService: (data) =>
    advancesModel.createService({
      ...serviceData(data),
      receiptNumber: `ADV-${Date.now()}`,
    }),
  async updateService(id, changes) {
    const current = await advancesModel.findService(id);
    const merged = serviceAdvanceSchema.parse({ ...current, ...changes });
    return advancesModel.updateService(id, serviceData(merged));
  },
  deleteService: advancesModel.deleteService,
};
