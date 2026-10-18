import { payrollModel } from "./payrolls.model.js";
import { payrollSchema } from "./payrolls.schema.js";
const calculate = (x) => {
  const grossSalary =
      x.baseSalary + x.overtimeAmount + x.bonusAmount + x.allowanceAmount,
    totalDeduction = x.lateDeduction + x.absenceDeduction + x.otherDeduction;
  return {
    ...x,
    grossSalary,
    totalDeduction,
    netSalary: grossSalary - totalDeduction,
    paidAt: x.status === "paid" ? (x.paidAt ?? new Date()) : x.paidAt,
  };
};
export const payrollService = {
  list: (q) => payrollModel.findAll(q),
  create: (x) => payrollModel.create(calculate(x)),
  async update(id, input) {
    const current = await payrollModel.findById(id);
    return payrollModel.update(
      id,
      calculate(payrollSchema.parse({ ...current, ...input })),
    );
  },
  remove: (id) => payrollModel.remove(id),
};
